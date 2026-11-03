        // [Module 2] Phụ Bản Ngày & Bí Cảnh Tứ Quốc
        // PB Ngày: chỉ kiểm tra và quét MIỄN PHÍ một lần mỗi ngày (handleSweepDungeons); không mua lượt bằng Tiên Ngọc.
        // Hết lượt miễn phí/đã quét từ trước là bình thường (log thông tin, không phải lỗi). Bí Cảnh Tứ Quốc: bi-canh-tu-quoc.js.
        function handleDailyAndBiCanh(ctx) {
            try {
                if (!ctx.DailyDungeonCtrl || !ctx.DailyDungeonCtrl.gInst) return false;
                const dd = ctx.DailyDungeonCtrl.gInst();
                if (!dd) return false;
                if (handleClimbDailyDungeons(ctx) || handleSweepDungeons(ctx)) return true;
                if (handleBiCanhTuQuoc(ctx)) return true;
                return false;
            } catch(e) { return false; }
        }
