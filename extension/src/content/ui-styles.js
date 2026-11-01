            const style = document.createElement('style');
            style.textContent = `
                #tn-auto-hud {
                    position: fixed;
                    top: 15px;
                    left: 15px;
                    width: 760px;
                    max-width: calc(100vw - 16px);
                    max-height: calc(100vh - 16px);
                    display: flex;
                    flex-direction: column;
                    background: rgba(24, 24, 37, 0.98);
                    color: #cdd6f4;
                    border: 1.5px solid rgba(203, 166, 247, 0.45);
                    border-radius: 14px;
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8), 0 0 16px rgba(203, 166, 247, 0.25);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    z-index: 9999999;
                    user-select: none;
                    touch-action: none;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                .tn-body-flex {
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
                    padding: 10px 12px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    min-height: 0;
                }
                .tn-col-left {
                    width: 300px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .tn-col-right {
                    flex: 1;
                    min-width: 400px;
                    display: flex;
                    flex-direction: column;
                    background: rgba(17, 17, 27, 0.55);
                    border: 1px solid rgba(203, 166, 247, 0.22);
                    border-radius: 10px;
                    padding: 10px;
                }
                .tn-feature-panels {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 440px;
                    padding-right: 4px;
                }
                .tn-feature-panels::-webkit-scrollbar { width: 4px; }
                .tn-feature-panels::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
                
                /* THANH NÚT CHẠY CỐ ĐỊNH Ở ĐÁY (STICKY FOOTER) */
                #tn-hud-footer {
                    background: linear-gradient(180deg, rgba(30, 30, 46, 0.98), rgba(17, 17, 27, 1));
                    padding: 9px 14px;
                    border-top: 1px solid rgba(203, 166, 247, 0.35);
                    box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.7);
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    z-index: 1000;
                    flex-shrink: 0;
                }
                #tn-hud-footer .tn-action-btn {
                    margin-bottom: 0;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
                }
                #tn-btn-main {
                    flex: 2;
                    font-size: 13px;
                    letter-spacing: 0.4px;
                    font-weight: 800;
                }
                #tn-btn-sweep {
                    flex: 1.2;
                    font-size: 11px;
                    font-weight: 700;
                }
                #tn-auto-hud::-webkit-scrollbar {
                    width: 4px;
                }
                #tn-auto-hud::-webkit-scrollbar-thumb {
                    background: #45475a;
                    border-radius: 4px;
                }
                .tn-accordion-header {
                    background: linear-gradient(135deg, rgba(69, 71, 90, 0.8), rgba(49, 50, 68, 0.8));
                    padding: 6px 10px;
                    border-radius: 7px;
                    margin-top: 6px;
                    margin-bottom: 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    font-size: 11px;
                    color: #cba6f7;
                    border: 1px solid rgba(203, 166, 247, 0.25);
                    user-select: none;
                    transition: background 0.15s, border-color 0.15s;
                }
                .tn-accordion-header:hover {
                    background: linear-gradient(135deg, rgba(88, 91, 112, 0.9), rgba(69, 71, 90, 0.9));
                    border-color: rgba(203, 166, 247, 0.5);
                }
                .tn-accordion-arrow {
                    font-size: 9px;
                    color: #f5c2e7;
                    font-weight: bold;
                    transition: transform 0.2s;
                }
                .tn-accordion-content {
                    transition: all 0.2s ease-in-out;
                }
                .tn-accordion-content.tn-collapsed {
                    display: none !important;
                }
                #tn-hud-header {
                    padding: 7px 10px;
                    background: linear-gradient(135deg, #45475a, #313244);
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    touch-action: none;
                }
                #tn-hud-title {
                    font-weight: bold;
                    font-size: 11.5px;
                    color: #f5c2e7;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                #tn-hud-body {
                    padding: 8px 10px;
                    font-size: 11px;
                }
                .tn-badge {
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: bold;
                }
                .tn-badge-ready { background: #585b70; color: #cdd6f4; }
                .tn-badge-running { background: #a6e3a1; color: #11111b; animation: tnPulse 1.5s infinite; }
                @keyframes tnPulse {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; filter: drop-shadow(0 0 5px #a6e3a1); }
                    100% { opacity: 0.8; }
                }
                .tn-role-card {
                    background: rgba(17, 17, 27, 0.85);
                    border-radius: 8px;
                    padding: 8px 10px;
                    margin-bottom: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .tn-role-name { font-weight: bold; color: #89b4fa; font-size: 13px; margin-bottom: 2px; }
                .tn-role-info { font-size: 11px; color: #a6adc8; }
                
                .tn-section-title {
                    font-size: 11px;
                    font-weight: bold;
                    color: #fab387;
                    margin: 8px 0 4px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .tn-tab-bar {
                    display: flex;
                    background: rgba(17, 17, 27, 0.95);
                    border-radius: 8px;
                    padding: 3px;
                    margin: 4px 0 8px 0;
                    border: 1px solid rgba(203, 166, 247, 0.3);
                    gap: 3px;
                }
                .tn-tab-btn {
                    flex: 1;
                    padding: 6px 1px;
                    border: none;
                    background: transparent;
                    color: #a6adc8;
                    font-size: 10px;
                    font-weight: bold;
                    border-radius: 6px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.15s ease;
                }
                .tn-tab-btn:hover {
                    color: #f5c2e7;
                    background: rgba(203, 166, 247, 0.12);
                }
                .tn-tab-btn.active {
                    background: linear-gradient(135deg, rgba(203, 166, 247, 0.4), rgba(180, 190, 254, 0.4));
                    color: #fff;
                    border: 1px solid rgba(203, 166, 247, 0.65);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                }
                .tn-tab-panel {
                    display: none;
                }
                .tn-tab-panel.active {
                    display: block;
                }
                #tn-auto-hud.tn-user-resized .tn-col-left,
                #tn-auto-hud.tn-user-resized .tn-col-right {
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-feature-panels {
                    display: flex;
                    flex-direction: column;
                    max-height: none;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active > .tn-opt-list {
                    flex: 1;
                    max-height: none;
                    min-height: 0;
                }
                #tn-auto-hud.tn-user-resized .tn-tab-panel.active > div:first-child:not(.tn-opt-list) {
                    flex: 1;
                }
                .tn-opt-list {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-bottom: 10px;
                    max-height: 190px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .tn-opt-list::-webkit-scrollbar { width: 4px; }
                .tn-opt-list::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
                .tn-opt-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(30, 30, 46, 0.65);
                    padding: 6px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .tn-opt-item:hover { background: rgba(49, 50, 68, 0.85); }
                .tn-opt-item input[type="checkbox"] {
                    accent-color: #cba6f7;
                    cursor: pointer;
                    transform: scale(1.15);
                }
                .tn-action-btn {
                    width: 100%;
                    padding: 8px 0;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 12px;
                    cursor: pointer;
                    margin-bottom: 6px;
                    transition: transform 0.1s, filter 0.15s;
                }
                .tn-action-btn:active { transform: scale(0.98); }
                .tn-btn-start { background: linear-gradient(135deg, #a6e3a1, #94e2d5); color: #11111b; }
                .tn-btn-stop { background: linear-gradient(135deg, #f38ba8, #eba0ac); color: #11111b; }
                .tn-btn-sweep { background: linear-gradient(135deg, #f9e2af, #fab387); color: #11111b; }
                #tn-log-content {
                    background: #11111b;
                    border-radius: 6px;
                    padding: 6px 8px;
                    height: 70px;
                    overflow-y: auto;
                    font-family: Consolas, monospace;
                    font-size: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                #tn-auto-hud.tn-user-resized #tn-log-content {
                    flex: 1;
                    min-height: 70px;
                    height: auto;
                }
                #tn-log-content::-webkit-scrollbar { width: 4px; }
                #tn-log-content::-webkit-scrollbar-thumb { background: #313244; }
                .tn-resize-handle {
                    position: absolute;
                    bottom: 1px;
                    width: 18px;
                    height: 18px;
                    z-index: 1001;
                    touch-action: none;
                }
                .tn-resize-left {
                    left: 1px;
                    cursor: nesw-resize;
                }
                .tn-resize-right {
                    right: 1px;
                    cursor: nwse-resize;
                }
                .tn-resize-left::after,
                .tn-resize-right::after {
                    position: absolute;
                    bottom: 4px;
                    width: 8px;
                    height: 8px;
                    content: "";
                    border-bottom: 2px solid #cba6f7;
                }
                .tn-resize-left::after {
                    left: 4px;
                    border-left: 2px solid #cba6f7;
                }
                .tn-resize-right::after {
                    right: 4px;
                    border-right: 2px solid #cba6f7;
                }

            `;
            document.head.appendChild(style);
