
        // [Module 5] Di Tích Tiên Giới
        function handleImmortalRelic(ctx) {
            try {
                if (ctx.RelicCtrl && ctx.RelicCtrl.gInst) {
                    const rc = ctx.RelicCtrl.gInst();
                    // Kiểm tra nếu có Lv4 -> Không làm mới, phái đội khai thác Lv4
                    if (typeof rc.hasLevel4Relic === 'function' && rc.hasLevel4Relic()) {
                        if (typeof rc.dispatchMineLv4 === 'function') {
                            rc.dispatchMineLv4();
                            sendLog("💎 [M5 - Di Tích] Phát hiện bệ tài nguyên Lv4! Đã phái đội khai thác an toàn.", "action");
                            return true;
                        }
                    } else {
                        // Làm mới các bệ Lv1, Lv2, Lv3
                        if (typeof rc.refreshLowerRelics === 'function') {
                            rc.refreshLowerRelics();
                            sendLog("🔄 [M5 - Di Tích] Đã làm mới các bệ tài nguyên Lv1-Lv3 để tìm Lv4.", "info");
                            return true;
                        }
                    }
                } else {
                    logUnsupportedOnce('m5', "⚠️ [M5 - Di Tích] Bản game hiện tại không có bộ điều khiển RelicCtrl; tính năng chưa hỗ trợ, không gửi thao tác nào.");
                }
                return false;
            } catch(e) { return false; }
        }
