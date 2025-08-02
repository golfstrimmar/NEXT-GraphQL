// " use client";
// import htmlToJSON from "@/utils/htmlToJson";
// import orderIndexes from "@/utils/orderIndexes";
// import {useStateContext} from "@/components/StateProvider";
//
//
// const ToBase = () => {
//     const {setHtmlJson} = useStateContext();
//     return(
//     const previewEl = document.getElementById("preview");
//     const newHtmlJson = htmlToJSON(previewEl.innerHTML);
//     const htmlOrdered = orderIndexes(newHtmlJson);
//     setHtmlJson(htmlOrdered);
//     )
// };
//
// export default ToBase;
import orderIndexes from "@/utils/orderIndexes";
import htmlToJSON from "@/utils/htmlToJson";

export function ToBase(
    setHtmlJson: (val: HtmlJsonType) => void
) {
    const previewEl = document.getElementById("preview");
    const newHtmlJson = htmlToJSON(previewEl.innerHTML);
    const htmlOrdered = orderIndexes(newHtmlJson);
    setHtmlJson(htmlOrdered);
}