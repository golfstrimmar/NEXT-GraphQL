import jsonToHtml from "@/utils/jsonToHtml";

const ToAdd = async (foo, htmlJson) => {
    if (foo) {
        const previewEl = document.getElementById("preview");
        const elements = previewEl.querySelectorAll("[data-index]");
        const elToAdd = `/data/${foo}.json`;
        const res = await fetch(elToAdd);
        const jsonToAdd = await res.json();
        console.log('<=====🔂jsonToAdd🔂=====>', jsonToAdd);
        return jsonToHtml(jsonToAdd);
    }
};

export default ToAdd;