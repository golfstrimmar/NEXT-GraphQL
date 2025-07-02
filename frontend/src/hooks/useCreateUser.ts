import { useEffect, useState } from "react";
import { useSubscription } from "@apollo/client";
import { useDispatch } from "react-redux";
import { USER_CREATED_SUBSCRIPTION } from "@/apolo/subscriptions";
import { addUser } from "@/app/redux/slices/authSlice";
export default function useCreateUser() {
  const dispatch = useDispatch();
  const { data: subDataCreated, error: subErrorCreated } = useSubscription(
    USER_CREATED_SUBSCRIPTION
  );
  useEffect(() => {
    if (subDataCreated?.userCreated) {
      console.log(
        "<====userCreated subscription====>",
        subDataCreated.userCreated
      );
      dispatch(
        addUser({
          ...subDataCreated.userCreated,
          id: Number(subDataCreated.userCreated.id),
          isLoggedIn: true,
        })
      );
    }
  }, [subDataCreated, dispatch]);
}
