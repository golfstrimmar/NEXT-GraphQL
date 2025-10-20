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
    console.log(
      "<=====🔂jsonToHtml(jsonToAdd))🔂=====>",
      jsonToHtml(jsonToAdd)
    );
    return jsonToHtml(jsonToAdd);
  }

  return null;
};

export default ToAdd;
