function dispatchEditor() {
    if ($("textarea[name=\"message\"]").val().split("\n").length >= 3)
        regionSettings = JSON.parse(atob($("textarea[name=\"message\"]").val().split("\n")[2]));

    //Create fields
    $("<tr></tr>").append($('<td class="leftside">Founder Title:</td>')).append($("<td></td>").append($('<input id="settingTitleFounder">').keyup(updateDispatchJSON))).insertBefore($("textarea[name=\"message\"]").parent().parent());
    $("<tr></tr>").append($('<td class="leftside">Delegate Title:</td>')).append($("<td></td>").append($('<input id="settingTitleDelegate">').keyup(updateDispatchJSON))).insertBefore($("textarea[name=\"message\"]").parent().parent());
    $("<tr></tr>").append($('<td class="leftside">IRC Server:</td>')).append($("<td></td>").append($('<input id="settingIRCServer">').keyup(updateDispatchJSON))).insertBefore($("textarea[name=\"message\"]").parent().parent());
    $("<tr></tr>").append($('<td class="leftside">IRC Channel:</td>')).append($("<td></td>").append($('<input id="settingIRCChannel">').keyup(updateDispatchJSON))).insertBefore($("textarea[name=\"message\"]").parent().parent());

    //Populate fields
    $("#settingTitleFounder").val((regionSettings.titles && regionSettings.titles.founder) ? regionSettings.titles.founder : "Founder");
    $("#settingTitleDelegate").val((regionSettings.titles && regionSettings.titles.delegate) ? regionSettings.titles.delegate : "WA Delegate");
    $("#settingIRCServer").val((regionSettings.irc && regionSettings.irc.server) ? regionSettings.irc.server : "");
    $("#settingIRCChannel").val((regionSettings.irc && regionSettings.irc.channel) ? regionSettings.irc.channel : "");
}

function updateDispatchJSON() {
    var json = "{"
    json += '"titles":{"founder":"' + $("#settingTitleFounder").val() + '","delegate":"' + $("#settingTitleDelegate").val() + '"},';
    json += '"irc":{"server":"' + $("#settingIRCServer").val() + '","channel":"' + $("#settingIRCChannel").val() + '"}'
    json += "}";

    $("textarea[name=\"message\"]").val("This dispatch is automatically generated by LibreNS++ (http://forum.nationstates.net/viewtopic.php?f=15&t=304199). Edit manually at your own risk!\n\n" + btoa(json));
}
