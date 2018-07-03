// 言語切り替え
const showLangage = (lang) => {
    localStorage.lang = lang;

    // 切り替え対象の locale リスト
    const langSet = ["jp", "en"];
    for (let i = 0, len = langSet.length; i < len; i++) {
        if (lang === langSet[i]) {
            $('.' + langSet[i]).show();
        } else {
            $('.' + langSet[i]).hide();
        }
    }

    const toolTips = {
        "font-size-btn": {
            "jp": "エディタのフォントサイズ変更",
            "en": "change editor font size"
        },
        "debug": {
            "jp": "可視化デバッグ実行開始(最初に1回必ず押す)",
            "en": "initiate program execution"
        },
        "stop": {
            "jp": "可視化デバッグ終了",
            "en": "stop program execution"
        },
        "reset": {
            "jp": "実行中のプログラムを最初に戻す",
            "en": "go backward for all step"
        },
        "back": {
            "jp": "前の式に戻る",
            "en": "go backward one step"
        },
        "step": {
            "jp": "次の式を実行する",
            "en": "go forward one step"
        },
        "exec": {
            "jp": "実行中のプログラムを最後まで実行する",
            "en": "go forward all steps"
        },
    }
    for (const key in toolTips) {
        const target = toolTips[key];
        const text = target[lang];
        $('#' + key).attr("title", text);
    }
}
export default showLangage;
