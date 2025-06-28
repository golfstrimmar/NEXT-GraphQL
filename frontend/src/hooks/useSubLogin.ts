import { useEffect, useState } from "react";
import { useSubscription } from "@apollo/client";
import { useDispatch } from "react-redux";
import { USER_LOGIN_SUBSCRIPTION } from "@/apolo/subscriptions";
import { updateUserStatus } from "@/app/redux/slices/authSlice";
export default function useSubLogin() {
  const dispatch = useDispatch();
  const { data: loggedInSubData, error: loggedInError } = useSubscription(
    USER_LOGIN_SUBSCRIPTION
  );
  useEffect(() => {
    if (loggedInSubData?.userLogin) {
      const userLogined = loggedInSubData.userLogin;
      console.log("<==== LOGIN SUBSCRIPTION ====>", userLogined);
      dispatch(
        updateUserStatus({
          id: Number(userLogined.id),
          status: true,
        })
      );
    }
  }, [loggedInSubData, dispatch]);
}
