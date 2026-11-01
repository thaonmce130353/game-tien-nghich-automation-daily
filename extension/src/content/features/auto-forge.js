
        // VÒNG LẶP ĐIỀU PHỐI CHÍNH
        // ============================================================================
        // 1. TỰ ĐỘNG RÈN TIÊN KHÍ & NÂNG KHÍ ĐỈNH (ĐẠO THÀNH)
        // ============================================================================
        let lastForgeTime = 0;
        let hasSetFilter = false;

        function handleForge(ctx) {
            if (!ctx.GodWeaponCtrl || !ctx.GodWeaponCtrl.gInst) return false;
            const gCtrl = ctx.GodWeaponCtrl.gInst();
            const infoVo = gCtrl.getInfoVo ? gCtrl.getInfoVo() : null;
            const now = Date.now();
            if (now - lastForgeTime < 1500) return true;

            // Bước 1: Kiểm tra nâng cấp Khí Đỉnh nếu đã đủ Đá Sao Trời & Tiên Ngọc
            if (infoVo && infoVo.nextStarCfg) {
                const nextCfg = infoVo.nextStarCfg;
                let enoughMaterials = true;
                const consumeItems = nextCfg.consume_item || [];
                for (let i = 0; i < consumeItems.length; i++) {
                    const itm = consumeItems[i];
                    if (itm && ctx.CommonViewUtils && !ctx.CommonViewUtils.isEnoughCost(itm.base_id, itm.num)) {
                        enoughMaterials = false;
                        break;
                    }
                }
                const isUpgrading = infoVo.isHasRemainTime ? infoVo.isHasRemainTime() : false;
                if (enoughMaterials && !isUpgrading && consumeItems.length > 0) {
                    sendLog('✨ ĐÁ SAO TRỜI & NGUYÊN LIỆU ĐÃ ĐỦ NÂNG CẤP KHÍ ĐỈNH! TIẾN HÀNH TĂNG CẤP...', 'success');
                    gCtrl.send32305(); // Tăng cấp Khí Đỉnh
                    
                    // Dừng tool theo yêu cầu người dùng
                    CONFIG.running = false;
                    saveConfig();
                    try {
                        window.top.postMessage({
                            source: 'TIEN_NGHICH_AUTO_GAME',
                            action: 'LOG',
                            message: '🛑 ĐÃ NÂNG CẤP KHÍ ĐỈNH THÀNH CÔNG VÀ DỪNG AUTO!',
                            logType: 'success'
                        }, '*');
                    } catch(e) {}
                    return true;
                }
            }

            // Bước 2: Thiết lập bộ lọc lần đầu: Tích chọn "Đánh giá Tiên Khí tăng" và Lưu
            if (!hasSetFilter) {
                const setting = gCtrl.getSettingVo ? gCtrl.getSettingVo() : null;
                const curStar = setting ? (setting.star || 0) : 0;
                const affixGroups = setting ? (setting.affix_group_list || []) : [];
                sendLog('⚙️ Đang cấu hình bộ lọc Tiên Khí: Tích chọn [Đánh giá Tiên Khí tăng]...', 'info');
                gCtrl.send32303(curStar, 1, affixGroups); // 1 = is_up_score
                hasSetFilter = true;
                lastForgeTime = now;
                return true;
            }

            // Bước 3: Kiểm tra nếu có Tiên Khí mới trong túi đồ để thay mới (đánh giá cao) hoặc tách/bán (đánh giá thấp)
            if (ctx.BackpackCtrl && ctx.BackpackCtrl.gInst) {
                const bp = ctx.BackpackCtrl.gInst();
                const weaponDic = bp.getGodWeaponDic ? bp.getGodWeaponDic() : {};
                const weaponKeys = Object.keys(weaponDic);
                if (weaponKeys.length > 0) {
                    const newItemUid = weaponKeys[0];
                    const newItem = weaponDic[newItemUid];
                    if (newItem) {
                        const itemCfg = ctx.PropsCtrl && ctx.PropsCtrl.gInst ? ctx.PropsCtrl.gInst().getItemDataConfigByBaseId(newItem.base_id) : null;
                        const pos = itemCfg ? itemCfg.type : 0;
                        const oldWeapon = infoVo && infoVo.weapons ? infoVo.weapons[pos] : null;

                        const scoreType = (ctx.ComCt && ctx.ComCt.IEquipAttrType && ctx.ComCt.IEquipAttrType.godWeaponScore) ? ctx.ComCt.IEquipAttrType.godWeaponScore : 1000;
                        const newScore = bp.getExattrVByK ? (bp.getExattrVByK(newItem.exattr, scoreType) || 0) : 0;
                        const oldScore = (oldWeapon && bp.getExattrVByK) ? (bp.getExattrVByK(oldWeapon.getItemVo().exattr, scoreType) || 0) : 0;

                        if (newScore > oldScore) {
                            sendLog(`⚡ Phát hiện Tiên Khí xịn hơn (${newScore} > ${oldScore})! Thay mới & tách đồ cũ...`, 'success');
                            gCtrl.send32307(newItem.id, 1); // 1 = wear & resolve old
                        } else {
                            sendLog(`🗑️ Tiên Khí mới đánh giá thấp hơn (${newScore} <= ${oldScore}). Tự động tách/bán...`, 'info');
                            gCtrl.send32304(newItem.id); // resolve new item
                        }
                        lastForgeTime = now;
                        return true;
                    }
                }
            }

            // Bước 4: Tiến hành Rèn Tiên Khí
            sendLog('🔨 Đang rèn Tiên Khí...', 'info');
            gCtrl.send32301();
            lastForgeTime = now;
            return true;
        }
