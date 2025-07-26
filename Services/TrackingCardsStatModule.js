/** Card statistics repository. key = UniqueID
 * @type {Map<string, { id: number, uniqueID: string, name: string, seen: boolean, played: boolean }> } 
 * */
const CardStatsMap = new Map();

export function TrackingModuleInitialization(modApi) {
    //#region ---------------Card Tracking Module--------------- //
    modApi.hookFunction("ClubCardLoadDeckNumber", 0, (args, next) => {
        const result = next(args);

        if (IsStatsUploadEnabled() && IsOpponentMoonCE()) {
            try {
                StartTrackingModule();
            } catch (error) {
                console.error("MoonCE Hook ClubCardLoadDeckNumber:", error.message);
            }
        }
        return result;
    });

    modApi.hookFunction("GameClubCardLoadData", 0, (args, next) => {
        const result = next(args);

        if (IsStatsUploadEnabled() && IsOpponentMoonCE()) {
            try {
                RefreshTrackingAfterSync(ClubCardPlayer[0]);
            } catch (error) {
                console.error("MoonCE Hook GameClubCardLoadData:", error.message);
            }
        }

        return result;
    });

    modApi.hookFunction("ClubCardCheckVictory", 5, (args, next) => {
        const isMiniGameEnded = MiniGameEnded;
        const result = next(args);

        if (IsStatsUploadEnabled() && IsOpponentMoonCE()) {
            try {
                if (ClubCardIsOnline() && ClubCardIsPlaying()) {
                    if (result && isMiniGameEnded != true) {
                        const player = args[0];
                        const isPlayer = player?.Character?.MemberNumber === Player.MemberNumber;
                        SendCardStatsToServer(isPlayer);
                    }          
                }
            } catch (error) {
                console.error("MoonCE Hook ClubCardCheckVictory:", error.message);
            }
        }

        return result;
    });

    //Hook to an event when a player has conceded for that very player.
    modApi.hookFunction("ClubCardConcede", 0, (args, next) => {
        if (IsStatsUploadEnabled() && IsOpponentMoonCE()) {
            try {
                if (ClubCardIsOnline() && ClubCardIsPlaying()) {
                    SendCardStatsToServer(false); 
                }
            } catch (error) {
                console.error("MoonCE Hook ClubCardConcede:", error.message);
            }
        }

        return next(args);
    });

    //Hook to the event that the winning player will receive if the opponent concedes.
    modApi.hookFunction("ClubCardPlayerConceded", 0, (args, next) => {
        if (args[0] == Player.MemberNumber) return next(args);

        if (IsStatsUploadEnabled() && IsOpponentMoonCE()) {
            try {
                if (ClubCardIsOnline() && ClubCardIsPlaying())
                    SendCardStatsToServer(true);
            } catch (error) {
                console.error("MoonCE Hook ClubCardPlayerConceded:", error.message);
            }
        }

        return next(args);
    });
    //#endregion
}

//#region Card Tracking Module
function StartTrackingModule() {
    InitTrackingFromDeckAndHand(ClubCardPlayer[0].Deck, ClubCardPlayer[0].Hand);
    HookAllPlayerZones(ClubCardPlayer[0]);
}

/* ** Initialize tracking from FullDeck (at game start) ** */
function InitTrackingFromDeckAndHand(deck, hand) {
    CardStatsMap.clear();
    const source = [...hand, ...deck];
    for (const card of source) {
        CardStatsMap.set(card.UniqueID, {
            id: card.ID,
            uniqueID: card.UniqueID,
            name: card.Name,
            seen: false,
            played: false
        });
    }
}

/* ** Mark a card as seen in hand ** */
function MarkSeen(card) {
    const stat = CardStatsMap.get(card.UniqueID);
    if (stat && !stat.seen) stat.seen = true;
}

/* ** Mark a card as played (on board/event/discard) ** */
function MarkPlayed(card) {
    const stat = CardStatsMap.get(card.UniqueID);
    if (stat && !stat.played) stat.played = true;
}

/* ** Hook array.push() to track card movement ** */
function HookPush(array, onCard) {
    const originalPush = array.push;
    array.push = function (...cards) {
        for (const card of cards) {
            if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) {
                onCard(card);
            }
        }
        return originalPush.apply(this, cards);
    };
}

function HookOpponentLiabilities(opponent) {
    const board = opponent.Board;
    const originalPush = board.push;

    board.push = function (...cards) {
        for (const card of cards) {
            if (card?.UniqueID && ClubCardIsLiability(card) && CardStatsMap.has(card.UniqueID)) {
                MarkPlayed(card);
            }
        }
        return originalPush.apply(this, cards);
    };
}

/* ** Apply push hooks to all player zones ** */
function HookAllPlayerZones(player) {
    HookPush(player.Hand, MarkSeen);
    HookPush(player.Board, MarkPlayed);
    HookPush(player.Event, MarkPlayed);
    HookPush(player.DiscardPile, MarkPlayed);

    //for liability
    HookOpponentLiabilities(ClubCardPlayer[1]);
}

/**
 * Builds a game result payload for API submission.
 * Includes all tracked cards with their evaluated scores.
 *
 * @param {boolean} win - Whether the player won the match.
 * @returns {{
 *   game_result: boolean,
 *   game_token: string | null,
 *   goes_first: boolean | null,
 *   name: string | null,
 *   nickname: string | null,
 *   member_number: number,
 *   cards: { id: number, name: string, score: number }[]
 * }} Complete payload object.
 */
function BuildPayload(win) {
    RefreshTrackingAfterSync(ClubCardPlayer[0]);
    const payload = [];
    for (const stat of CardStatsMap.values()) {
        const score = EvaluateScore(stat);
        payload.push({
            id: stat.id,
            name: stat.name,
            score: parseFloat(score.toFixed(2))
        });
    }

    const game = Player.MoonCE.Game ?? {};
    const token1 = game.Player1Token ?? "";
    const token2 = game.Player2Token ?? "";
    const gameToken = (token1 && token2) ? `${token1}${token2}` : null;

    const goesFirst = typeof game.GoesFirst === "boolean" ? game.GoesFirst : null;

    return {
        game_result: win,
        game_token: gameToken,
        goes_first: goesFirst,
        name: Player?.Name ?? null,
        nickname: Player?.Nickname ?? null,
        member_number: Player?.MemberNumber ?? 0,
        cards: payload
    };
}

/* ** Simple scoring logic based on card usage ** */
function EvaluateScore(stat) {
    if (stat.played) return 1;
    if (stat.seen) return 0.5;
    return 0.1;
}

/**
 * Reapply push hooks and reanalyze state after receiving full game state from opponent.
 * Should be called immediately after local ClubCardPlayer[0] is overwritten.
 *
 * @param {object} player - The local player object (ClubCardPlayer[0])
 */
function RefreshTrackingAfterSync(player) {
    HookAllPlayerZones(player);

    for (const card of player.Hand) {
        if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkSeen(card);
    }
    for (const card of player.Board) {
        if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
    for (const card of player.Event) {
        if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
    for (const card of player.DiscardPile) {
        if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
}

/**
 * Sends the final payload to the server.
 *
 * @param {win: boolean } win - Array of card stats.
 */
function SendCardStatsToServer(win) {
    const payload = BuildPayload(win);
    const isDebugMode = Player?.OnlineSharedSettings?.MoonCE?.Settings?.DebugMode;
    
    if (isDebugMode)
        console.log("📦 Payload to be sent:", payload);

    fetch("https://clubcardmonitoring.onrender.com/api/upload-cardstats/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(r => r.text())
        .then(text => {
            if (isDebugMode)
                console.log("📡 Server response:", text);
        })
        .catch(err => {
            if (isDebugMode)
                console.error("❌ Failed to send card stats:", err);
        });
}

function IsStatsUploadEnabled() {
    return Player?.OnlineSharedSettings?.MoonCE?.Settings?.UploadGameStats;
}

function IsOpponentMoonCE() {
    return ClubCardPlayer?.[1]?.Character?.MoonCE;
}

//#endregion