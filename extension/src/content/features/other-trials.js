
        // [Module 4] Cửu Uyển Nhi, Cổ Thần Địa - chạy lần lượt (Cực Âm Địa là tính năng riêng), xong bước nào mới sang bước kế tiếp.
        function handleOtherTrials(ctx) {
            try {
                const uyenNhi = handleUyenNhi(ctx);
                if (uyenNhi !== 'done') return uyenNhi === 'acted';
                const coThan = handleCoThanDia(ctx);
                if (coThan !== 'done') return coThan === 'acted';
                return false;
            } catch(e) { return false; }
        }
