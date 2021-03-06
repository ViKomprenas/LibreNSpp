function setupSettings() {
    if (!rift) {
        $("#banner, #nsbanner").prepend(
             $('<div id="librenspp" style="position: absolute; top: 0; right: 200px; margin: 6px 16px 0 0; z-index: 100;"></div>')
             .html('<a href="//www.nationstates.net/page=blank/x-librenspp=settings" style="color: white; font-weight: bold; font-size: 8pt; padding: 2px 8px 2px 8px; background: black; background-color: rgba(0,0,0,0.2); border-radius: 8px; zoom: 1;">LibreNS++</a>')
        );
    } else {
        $("#banner .belspacer:not(.belspacermain)").after(
             $('<div id="librenspp" class="bel"></div>')
             .html('<div class="belcontent"><a class="bellink" href="//www.nationstates.net/page=blank/x-librenspp=settings"><i class="icon-lightbulb"></i>LIBRENS++</a></div>')
        );
    }
}

function loadSettingBool(setting, def) {
    settings[setting] = NS_getValueBool("setting_" + setting, def);
}

function loadSettingText(setting, def) {
    settings[setting] = String(NS_getValue("setting_" + setting, def));
}

function loadSettingNumber(setting, def) {
    settings[setting] = Number(NS_getValue("setting_" + setting, def));
}

function loadSettings() {
    //Updates
    loadSettingBool("autoUpdate", true);
    //LibreNS++ Features
    loadSettingBool("infiniteRMBScroll", true);
    loadSettingBool("liveRMBupdate", true);
    loadSettingBool("soundRMBupdate", false);
    loadSettingBool("regionCustomise", true);
    loadSettingBool("regionIRC", true);
    loadSettingBool("latestForum", true);
    loadSettingBool("cosmetic", true);
    loadSettingBool("floatingSidebar", true);
    //NationStates++ Compatibility
    loadSettingBool("nsppTitles", false);
    loadSettingBool("nsppNewspaper", false);
    loadSettingBool("nsppIRC", false);
    //Miscellaneous
    loadSettingNumber("updateSpeed", 5000);
    //Danger!
    loadSettingBool("nagPuppets", false);
    
    return settings;
}

function manageSettings() {
    var pageContent = '<h1>LibreNS++ Settings</h1>';
    pageContent += '<p style="font-size: 0.9em;">LibreNS++ version ' + version + '. <a href="https://forum.nationstates.net/viewtopic.php?f=15&t=304199">Forum</a>, <a href="https://github.com/RunasSudo/LibreNSpp">GitHub</a>, <a href="https://www.nationstates.net/nation=south_jarvis">South Jarvis (creator)</a>.</p>';
    pageContent += '<form id="librensppSettings" onSubmit="return false;">';
    pageContent += '<h2>Updates</h2>';
    pageContent += '<p id="new-version" style="color: darkred; font-weight: 700;">A new version of LibreNS++ (<span id="new-version-actual">can\'t determine version number</span>) is available, please check the forum thread.</p>';
    pageContent += '<p id="current-version" style="color: darkgreen; font-weight: 700;">Your copy of LibreNS++ is up to date!</p>'
    pageContent += '<input type="checkbox" id="autoUpdate"><label for="autoUpdate">Check for updates automatically.</label><br>';
    pageContent += '<br>';
    pageContent += '<h2>LibreNS++ Features</h2>';
    pageContent += '<input type="checkbox" id="infiniteRMBScroll"><label for="infiniteRMBScroll">Enable infinite RMB scroll.</label><br>';
    pageContent += '<input type="checkbox" id="liveRMBupdate"><label for="liveRMBupdate">Enable live RMB updates.</label><br>';
    pageContent += '&nbsp;&nbsp;&nbsp;<input type="checkbox" id="soundRMBupdate"><label for="soundRMBupdate">Play the notification sound when a new RMB post arrives.</label><br>';
    pageContent += '<audio>&nbsp;&nbsp;&nbsp;If you can see this text, the notification sound is not supported by your browser.<br></audio>';
    pageContent += '<input type="checkbox" id="infiniteTelegram" disabled><label for="infiniteTelegram">Enable infinite telegram folders.</label><br>';
    pageContent += '<input type="checkbox" id="regionCustomise"><label for="regionCustomise">Enable regional customisation.</label><br>';
    pageContent += '&nbsp;&nbsp;&nbsp;<input type="checkbox" id="regionIRC"><label for="regionIRC">Enable regional IRC.</label><br>';
    pageContent += '<input type="checkbox" id="latestForum"><label for="latestForum">Show latest forum topics in the sidebar.</label><br>';
    pageContent += '<input type="checkbox" id="cosmetic"><label for="cosmetic">Apply various minor cosmetic changes. (Requires Rift.)</label><br>';
    pageContent += '<input type="checkbox" id="floatingSidebar"><label for="floatingSidebar">Float the sidebar, so it follows you as you scroll down. (Requires Rift.)</label><br>';
    pageContent += '<br>';
    pageContent += '<h2>NationStates++ Compatibility</h2>';
    pageContent += '<input type="checkbox" id="nsppTitles"><label for="nsppTitles">Enable NationStates++ regional titles.</label><br>';
    pageContent += '<input type="checkbox" id="nsppNewspaper"><label for="nsppNewspaper">Enable NationStates++ regional newspapers.</label><br>';
    pageContent += '<input type="checkbox" id="nsppIRC"><label for="nsppIRC">Enable NationStates++ regional IRC.</label><br>';
    pageContent += '<br>';
    pageContent += '<h2>Miscellaneous</h2>';
    pageContent += '<button id="testDing">Test the notification sound</button><br>';
    pageContent += '&nbsp;&nbsp;&nbsp;<a href="http://www.freesound.org/people/Corsica_S/sounds/91926/">"ding.wav" by Corsica_S. Used under the CC BY 3.0 licence.</a><br>';
    pageContent += '<label for="updateSpeed">Set a custom frequency to update automatically-updating parts of NS (milliseconds):</label> <input type="number" id="updateSpeed"><br>';
    pageContent += '&nbsp;&nbsp;&nbsp;<span style="color: darkred;" id="updateSpeedWarning">You are solely responsible for any consequences of decreasing this limit.</span>';
    pageContent += '<br>';
    pageContent += '<h2>Use at your own risk!</h2>';
    pageContent += '<input type="checkbox" id="nagPuppets"><label for="nsppTitles">Suppress warning about insecure puppet password storage.</label><br>';
    pageContent += '</form>';
    $("#content").html(pageContent);
    $("#new-version, #current-version, #updateSpeedWarning").hide();
    if (settings["updateSpeed"] < 5000) {
        $("#updateSpeedWarning").show();
    }
    
    function settingCheckbox(setting) {
        $("#" + setting).prop("checked", settings[setting]);
    }
    
    //Updates
    settingCheckbox("autoUpdate");
    //LibreNS++ Features
    settingCheckbox("infiniteRMBScroll");
    settingCheckbox("liveRMBupdate");
    settingCheckbox("soundRMBupdate");
    settingCheckbox("regionCustomise");
    settingCheckbox("regionIRC");
    settingCheckbox("latestForum");
    settingCheckbox("cosmetic");
    settingCheckbox("floatingSidebar");
    //NationStates++ Compatibility
    settingCheckbox("nsppTitles");
    settingCheckbox("nsppNewspaper");
    settingCheckbox("nsppIRC");
    //Miscellaneous
    $("#updateSpeed").val(settings["updateSpeed"]);
    //Danger!
    settingCheckbox("nagPuppets");
    
    $("#cosmetic, #floatingSidebar").prop("disabled", rift ? undefined : "needs Rift");
    
    $("#librensppSettings input[type='checkbox']").change(function() {
        NS_setValue("setting_" + this.id, this.checked);
    });
    
    $("#librensppSettings input[type='number'], #librensppSettings input[type='text']").change(function() {
        NS_setValue("setting_" + this.id, this.value);
    });
    
    //-------------------------
    //Setting-specific handlers
    
    $("#updateSpeed").change(function() {
        if (Number($("#updateSpeed").val()) < 5000) {
            $("#updateSpeedWarning").show();
        } else {
            $("#updateSpeedWarning").hide();
        }
    });
    
    $("#testDing").click(notifySound);
}
