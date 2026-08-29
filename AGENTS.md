# Blinko Vault App rules

Use only the host-owned `secrets` Custom View API. Never store credentials in App entities, App state,
localStorage, logs, search documents, URLs, or third-party services. Clear revealed plaintext when the
selection changes or the view unmounts. Secret sharing must be an explicit user action. Do not add
network permissions, timers, polling, background workers, notifications, or scheduled jobs.

