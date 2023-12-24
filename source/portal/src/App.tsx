import React, { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Button from "components/Button";
import Axios from "axios";
import { Amplify, Auth, Hub, I18n } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";

import Footer from "components/layout/footer";
import Home from "pages/home/Home";
import CheckPoints from "pages/checkPoints/CheckPoints";

import { AMPLIFY_CONFIG_JSON, AMPLIFY_ZH_DICT } from "assets/js/const";
import { useDispatch } from "react-redux";
import { ActionType } from "reducer/appReducer";
import LoadingText from "components/LoadingText";
import LHeader from "components/layout/header";
import { AmplifyConfigType, AppSyncAuthType } from "types";
import { AuthProvider, useAuth } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { useTranslation } from "react-i18next";
import "@aws-amplify/ui-react/styles.css";
import CheckPointsHistory from "pages/checkPoints/CheckPointsHistory";
import TestDetails from "pages/checkPoints/TestDetails";

export interface SignedInAppProps {
  oidcSignOut?: () => void;
}

const loginComponents = {
  Header() {
    const { t } = useTranslation();
    return (
      <div className="atp-login-title">{t("signin.signInToSolution")}</div>
    );
  },
};

const AmplifyLoginPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="atp-login">
      <Authenticator
        hideSignUp
        components={loginComponents}
        formFields={{
          signIn: {
            username: {
              label: t("signin.email") || "",
              placeholder: t("signin.inputEmail") || "",
              isRequired: true,
            },
            password: {
              label: t("signin.password") || "",
              placeholder: t("signin.inputPassword") || "",
              isRequired: true,
            },
          },
        }}
      ></Authenticator>
    </div>
  );
};

const SignedInApp: React.FC<SignedInAppProps> = (props: SignedInAppProps) => {
  const { t } = useTranslation();
  return (
    <div className="App">
      <LHeader oidcSignOut={props.oidcSignOut} />
      <Router>
        <main className="lh-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/integration-test/checkpoints" element={<CheckPoints />} />
            <Route
              path="/integration-test/checkpoints/history/:id"
              element={<CheckPointsHistory />}
            />
            <Route
              path="/integration-test/checkpoints/history/detail/:id"
              element={<TestDetails />}
            />

            <Route
              path="*"
              element={
                <div className="lh-main-content">
                  <div className="lh-container pd-20">
                    <div className="not-found">
                      <h1>{t("pageNotFound")}</h1>
                      <Link to="/">
                        <Button>{t("home")}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </Router>
      <footer className="lh-footer">
        <Footer />
      </footer>
    </div>
  );
};

const AmplifyAppRouter: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>();

  const dispatch = useDispatch();
  const onAuthEvent = (payload: any) => {
    if (payload?.data?.code === "ResourceNotFoundException") {
      window.localStorage.removeItem(AMPLIFY_CONFIG_JSON);
      window.location.reload();
    } else {
      Auth?.currentAuthenticatedUser()
        .then((authData: any) => {
          dispatch({
            type: ActionType.UPDATE_USER_EMAIL,
            email: authData?.attributes?.email,
          });
          setAuthState(AuthState.SignedIn);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  Hub.listen("auth", (data) => {
    const { payload } = data;
    onAuthEvent(payload);
  });

  useEffect(() => {
    if (authState === undefined) {
      Auth?.currentAuthenticatedUser()
        .then((authData: any) => {
          dispatch({
            type: ActionType.UPDATE_USER_EMAIL,
            email: authData?.attributes?.email,
          });
          setAuthState(AuthState.SignedIn);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    return onAuthUIStateChange((nextAuthState, authData: any) => {
      setAuthState(nextAuthState);
      dispatch({
        type: ActionType.UPDATE_USER_EMAIL,
        email: authData?.attributes?.email,
      });
    });
  }, [authState]);

  return authState === AuthState.SignedIn ? (
    <SignedInApp />
  ) : (
    <AmplifyLoginPage />
  );
};

const OIDCAppRouter: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    return auth?.events?.addAccessTokenExpiring(() => {
      auth.signinSilent();
    });
  }, [auth.events, auth.signinSilent]);

  if (auth.isLoading) {
    return (
      <div className="pd-20 text-center">
        <LoadingText text={t("loading")} />
      </div>
    );
  }

  if (auth.error) {
    if (auth.error.message.startsWith("No matching state")) {
      window.location.href = "/";
      return null;
    }
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    dispatch({
      type: ActionType.UPDATE_USER_EMAIL,
      email: auth.user?.profile?.email,
    });
    return (
      <div>
        <SignedInApp
          oidcSignOut={() => {
            auth.removeUser();
          }}
        />
      </div>
    );
  }

  return (
    <div className="oidc-login">
      <div>
        <div className="title">{t("name")}</div>
      </div>
      {
        <div>
          <Button
            btnType="primary"
            onClick={() => {
              auth.signinRedirect();
            }}
          >
            {t("signin.signInToSolution")}
          </Button>
        </div>
      }
    </div>
  );
};

const App: React.FC = () => {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [oidcConfig, setOidcConfig] = useState<any>();
  const [authType, setAuthType] = useState<AppSyncAuthType>(
    AppSyncAuthType.OPEN_ID
  );
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  I18n.putVocabularies(AMPLIFY_ZH_DICT);
  I18n.setLanguage(i18n.language);

  const initAuthentication = (configData: AmplifyConfigType) => {
    dispatch({
      type: ActionType.UPDATE_AMPLIFY_CONFIG,
      amplifyConfig: configData,
    });
    setAuthType(configData.aws_appsync_authenticationType);
    if (configData.aws_appsync_authenticationType === AppSyncAuthType.OPEN_ID) {
      const settings = {
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        authority: configData.aws_oidc_provider,
        scope: "openid email profile",
        automaticSilentRenew: true,
        client_id: configData.aws_oidc_client_id,
        redirect_uri: configData.aws_oidc_customer_domain
          ? configData.aws_oidc_customer_domain
          : "https://" + configData.aws_cloudfront_url,
      };
      setOidcConfig(settings);
    } else {
      Amplify.configure(configData);
    }
  };

  const setLocalStorageAfterLoad = () => {
    if (localStorage.getItem(AMPLIFY_CONFIG_JSON)) {
      const configData = JSON.parse(
        localStorage.getItem(AMPLIFY_CONFIG_JSON) || ""
      );
      initAuthentication(configData);
      setLoadingConfig(false);
    } else {
      const timeStamp = new Date().getTime();
      setLoadingConfig(true);
      Axios.get(`/aws-exports.json?timestamp=${timeStamp}`).then((res) => {
        const configData: AmplifyConfigType = res.data;
        localStorage.setItem(AMPLIFY_CONFIG_JSON, JSON.stringify(res.data));
        initAuthentication(configData);
        setLoadingConfig(false);
      });
    }
  };

  useEffect(() => {
    document.title = t("title");
    if (window.performance) {
      if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
        const timeStamp = new Date().getTime();
        setLoadingConfig(true);
        Axios.get(`/aws-exports.json?timestamp=${timeStamp}`).then((res) => {
          const configData: AmplifyConfigType = res.data;
          localStorage.setItem(AMPLIFY_CONFIG_JSON, JSON.stringify(res.data));
          initAuthentication(configData);
          setLoadingConfig(false);
        });
      } else {
        setLocalStorageAfterLoad();
      }
    } else {
      setLocalStorageAfterLoad();
    }
  }, []);

  if (loadingConfig) {
    return (
      <div className="pd-20 text-center">
        <LoadingText text={t("loading")} />
      </div>
    );
  }

  if (authType === AppSyncAuthType.OPEN_ID) {
    return (
      <AuthProvider {...oidcConfig}>
        <OIDCAppRouter />
      </AuthProvider>
    );
  }

  return <AmplifyAppRouter />;
};

export default App;
