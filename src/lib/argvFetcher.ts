export default (
  argvs: string[],
  args: string[],
  defaultReturn?: string
): string | undefined => {
  for (const [index, argv] of argvs.entries()) {
    for (const arg of args) {
      if (argv.startsWith(arg)) {
        return argvs[index + 1];
      }
    }
  }

  return defaultReturn;
};
