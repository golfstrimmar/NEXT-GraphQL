import client from "@/apollo/apolloClient";
import { GET_USERS } from "@/apollo/queries";
import UsersList from "@/components/UsersList/UsersList";

export default async function UsersPage() {
  const { data } = await client.query({
    query: GET_USERS,
    fetchPolicy: "cache-first",
  });

  return <UsersList initialUsers={data.users} />;
}
