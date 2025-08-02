import orderIndexes from "@/utils/orderIndexes";
import jsonToHtml from "@/utils/jsonToHtml";
import formatHtml from "@/utils/formatHtml";

const RenderJson = (foo) => {
    if (foo) {
        const codeOrdered = orderIndexes(foo);
        const codeRenderd = jsonToHtml(codeOrdered);
        // console.log('<=====♻️codeRenderd♻️=====>', codeRenderd);
        const formattedCode = formatHtml(codeRenderd);
        // console.log('<=====♻️formattedCode  ♻️=====>', formattedCode);
        document.getElementById("preview").innerHTML = formattedCode;
        return formattedCode;
    }
};

export default RenderJson;