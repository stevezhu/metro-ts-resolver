import { dirname } from 'node:path';

import type { CustomResolver } from 'metro-resolver';
import {
  createCompilerHost,
  findConfigFile,
  parseJsonConfigFileContent,
  readConfigFile,
  resolveModuleName,
  sys,
} from 'typescript';

export type CreateTsResolveRequestOptions = {
  /**
   * Directory that contains the tsconfig.json file
   */
  projectDir: string;
  /**
   * Name of the tsconfig.json file
   */
  tsconfigName?: string;
};

/**
 * @param options
 * @returns
 */
export function createTsResolveRequest({
  projectDir,
  tsconfigName = 'tsconfig.json',
}: CreateTsResolveRequestOptions): CustomResolver {
  const configPath = findConfigFile(
    projectDir,
    sys.fileExists.bind(sys),
    tsconfigName,
  );
  if (!configPath) {
    throw new Error(`${tsconfigName} not found`);
  }
  const configFile = readConfigFile(configPath, sys.readFile.bind(sys));
  const parsedConfig = parseJsonConfigFileContent(
    configFile.config,
    sys,
    dirname(configPath),
  );
  const host = createCompilerHost(parsedConfig.options);

  return function resolveRequest(context, rawModuleName, platform) {
    const isOriginModuleTs =
      context.originModulePath.endsWith('.ts') ||
      context.originModulePath.endsWith('.tsx');
    const isJs = rawModuleName.endsWith('.js');
    if (isOriginModuleTs && isJs) {
      const result = resolveModuleName(
        rawModuleName,
        context.originModulePath,
        parsedConfig.options,
        host,
      );
      if (result.resolvedModule) {
        return context.resolveRequest(
          context,
          rawModuleName.replace('.js', result.resolvedModule.extension),
          platform,
        );
      }
    }
    return context.resolveRequest(context, rawModuleName, platform);
  };
}
