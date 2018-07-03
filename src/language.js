// 言語切り替え
const showLangage = (lang) => {
    const langSet = ["jp", "en"];     // 切り替え対象の locale リスト
    for (let i = 0, len = langSet.length; i < len; i++) {
        if (lang === langSet[i]) {
            $('.' + langSet[i]).show();
        } else {
            $('.' + langSet[i]).hide();
        }
    }
}
export default showLangage;
