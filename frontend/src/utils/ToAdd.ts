// import jsonToHtml from "@/utils/jsonToHtml";

// const ToAdd = async (foo, htmlJson) => {
//   if (foo) {
//     const previewEl = document.getElementById("preview");
//     const elements = previewEl.querySelectorAll("[data-index]");
//     const elToAdd = `/data/${foo}.json`;
//     const res = await fetch(elToAdd);
//     const jsonToAdd = await res.json();
//     console.log("<=====🔂jsonToAdd🔂=====>", jsonToAdd);
//     return jsonToHtml(jsonToAdd);
//   }
// };

// export default ToAdd;
import jsonToHtml from "@/utils/jsonToHtml";
import client from "@/apollo/apolloClient"; // твой ApolloClient
import { GET_JSON_DOCUMENT } from "@/apollo/queries";

const ToAdd = async (foo) => {
  if (!foo) return null;

  const { data } = await client.query({
    query: GET_JSON_DOCUMENT,
    variables: { name: foo },
  });

  const jsonToAdd = data?.jsonDocumentByName?.content;

  if (jsonToAdd) {
    console.log("<=====🔂jsonToAdd🔂=====>", jsonToAdd);
    return jsonToHtml(jsonToAdd);
  }

  return null;
};

export default ToAdd;
