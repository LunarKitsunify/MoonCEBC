export function InitChatCommand() {
    CommandCombine([{
        Tag: 'moonhelp',
        Description: "Moon Card Editor commands",
        Action: () => {
            MoonHelpCommand();
        }
    }])

    CommandCombine([{
        Tag: 'moonstats',
        Description: "Enable or disable statistics tracking in ClubCard. Usage: /moonstats on | off",
        Action: (args) => {
            const input = args.trim().toLowerCase();
            if (input === "on") {
                SetStatsTracking(true);
            } else if (input === "off") {
                SetStatsTracking(false);
            } else {
                ChatRoomSendLocal("Usage: <b>/moonstats on</b> or <b>/moonstats off</b>");
            }
        }
    }])
}

function MoonHelpCommand() {
    const msg =
    "━━━━━━━━━━━━━━━━━━━━━━━<br>" +
    "Moon Cards Editor commands:<br><br>" +
    `<strong style="cursor: pointer;" onclick='window.CommandSet("moonstats on")'>/moonstats on</strong> — enable clubcard statistic tracking.<br>` +
    `<strong style="cursor: pointer;" onclick='window.CommandSet("moonstats off")'>/moonstats off</strong> — disable clubcard statistic tracking.<br>` +
    `Join the BC Cards Community: <a href='https://discord.gg/ZByQXVHm4u' target='_blank'>Discord Server</a><br>` +
    "━━━━━━━━━━━━━━━━━━━━━━━";

    ChatRoomSendLocal(msg);
}

function SetStatsTracking(enabled) {
    const moonCe = Player.OnlineSharedSettings.MoonCE ??= {};
    const settings = moonCe.Settings ??= {};

    settings.UploadGameStats = enabled;
    ServerAccountUpdate.QueueData({ OnlineSharedSettings: Player.OnlineSharedSettings });

    if (enabled)
        ChatRoomSendLocal("Statistics tracking is enabled. You can check the result here: <a href='https://clubcardmonitoring.onrender.com/' target='_blank'>ClubCard Monitoring</a>");
    else
        ChatRoomSendLocal("Statistics tracking is disabled.");
}