function regionPage(regionSettings) {
    //--------------------
    //Custom titles
    if (regionSettings.titles) {
        if (regionSettings.titles.delegate)
            $("strong:contains(WA Delegate:)").text(regionSettings.titles.delegate + ":");
        if (regionSettings.titles.founder)
            $("strong:contains(Founder:)").text(regionSettings.titles.founder + ":");
    }

    //--------------------
    //Embedded IRC
    if (regionSettings.irc) {
        var ircURL = "https://kiwiirc.com/client/";
        if (regionSettings.irc.server) {
            ircURL += regionSettings.irc.server + "/";
            if (regionSettings.irc.channel)
                ircURL += regionSettings.irc.channel;
            $('<iframe src="' + ircURL + '" style="border:0; width:100%; height:450px;"></iframe><div class="hzln"></div>').insertBefore($("h2:contains(Today's World Census Report)"));
        }
    }

    //--------------------
    //Regional Newspaper
    if (regionSettings.newspaper) {
        var dispatch = parseInt(regionSettings.newspaper); //Safe!*
        $.get("/page=dispatch/id=" + dispatch, function(data) {
            var newspaper = JSON.parse(atob($(data).find("#dispatch p").get(0).innerText));
            $('<p><strong>Newspaper:</strong> <a href="/page=blank/x-librenspp=newspaper=' + dispatch + '">' + sanitize(newspaper.title) + '</a></p>').insertBefore($(".wfe"));
        });
    }

    //--------------------
    //Infinite RMB scroll
    var rmb = $(".rmbtable2");
    rmb.children().each(function(i, entry) {
        $(entry).linkify();
        rmb.prepend(entry); //Reverse order so newest are at top.
    });
    $(".rmbolder").hide(); //GO AWAI!

    $("form#rmb").insertBefore(rmb.parent()); //Move the 'Leave a Message' form.

    //Add scroll detector
    $('<div id="infiniteScroll" style="border: 1px #CCC solid; border-radius: 12px; margin-top: 4px; margin-bottom: 4px; padding: 0 8px 0 12px; background-color: #FDFFFC; text-align: center; font-weight: bold; margin-left: 18%; margin-right: 18%; min-height: 18px; color: #AAA;"></div>')
        .html("Infinite Scroll!")
        .insertAfter(rmb.parent());

    infiniteScroll();

    //--------------------
    //Live RMB updates
    updateRMB();
}

var rmbOffset = 0;

function infiniteScroll() { //Triggered at intervals. Handles infinite scrolling.
    if ($("#infiniteScroll").offset().top <= $(window).scrollTop() + $(window).height()) { //Check if #infiniteScroll is in view.
        //Load new RMB messages.
        $("#infiniteScroll").html("Loading&hellip;");
        rmbOffset += 10;
        $.get("/page=ajax/a=rmb/region=" + window.location.href.substring(window.location.href.indexOf("/region=") + 8) + "/offset=" + rmbOffset, function(data) {
            if (data.length > 1) {
                $($(data).get().reverse()).insertAfter(".rmbrow:last").linkify();
                $("#infiniteScroll").html("Infinite Scroll!");
                setTimeout(infiniteScroll, 500);
            } else {
                $("#infiniteScroll").html("At earliest message.");
                rmbOffset -= 10;
            }
        });
    } else {
        setTimeout(infiniteScroll, 500);
    }
}

function updateRMB() { //Triggered at intervals. Looks for live RMB updates.
    $.get("/page=ajax/a=rmb/region=" + window.location.href.substring(window.location.href.indexOf("/region=") + 8) + "/offset=0", function(data) {
        $(data).each(function(i, post) {
            if ($("div#" + post.id).length == 0) { //It's a new post!
                $(post).insertBefore(".rmbrow:first").linkify();
                rmbOffset += 1;
            } else {
                $("div#" + post.id).html($(post).html()).linkify();
            }
        });
    });

    setTimeout(updateRMB, 5000);
}
