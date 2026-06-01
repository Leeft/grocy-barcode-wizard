export default function ShowEnv() {
  const env: Record<string, unknown> = {};
  const keys = Object.keys(process.env);
  keys.sort().forEach((key) => {
    if (/^[A-Z][A-Z_-]+$/.test(key)) {
      if (!/^(XDG|SSH|NODE|PNPM|LESS|NEXT_|NVM_)/.test(key)) {
        if (
          !/^(HOME|LANG|INIT_CWD|LOGNAME|LS_COLORS|PWD|OLDPWD|PATH|PORT|SHELL|RUST_MIN_STACK|SHELL|SHLVL|TERM|TURBOPACK|USER|DBUS_SESSION_BUS_ADDRESS|DEBUGINFOD_URLS)$/.test(
            key,
          )
        ) {
          env[key] = process.env[key];
        }
      }
    }
  });
  
  return <pre className="py-5">{JSON.stringify(env, null, 2)}</pre>;
}
