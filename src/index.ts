import { dirname } from 'node:path';
import ts from 'typescript';
import type { CustomResolver } from 'metro-resolver';

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
  const configPath = ts.findConfigFile(
    projectDir,
    ts.sys.fileExists,
    tsconfigName,
  );
  if (!configPath) {
    throw new Error(`${tsconfigName} not found`);
  }
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    dirname(configPath),
  );
  const host = ts.createCompilerHost(parsedConfig.options);

  return function resolveRequest(context, rawModuleName, platform) {
    const isOriginModuleTs =
      context.originModulePath.endsWith('.ts') ||
      context.originModulePath.endsWith('.tsx');
    const isJs = rawModuleName.endsWith('.js');
    if (isOriginModuleTs && isJs) {
      const result = ts.resolveModuleName(
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
