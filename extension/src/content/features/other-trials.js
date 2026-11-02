
        // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa, Cực Âm Địa - chạy lần lượt, xong bước nào mới sang bước kế tiếp.
        function handleOtherTrials(ctx) {
            try {
                const uyenNhi = handleUyenNhi(ctx);
                if (uyenNhi !== 'done') return uyenNhi === 'acted';
                const coThan = handleCoThanDia(ctx);
                if (coThan !== 'done') return coThan === 'acted';
                // 3. Cực Âm Địa
                return handleExtremeYin(ctx);
            } catch(e) { return false; }
        }
