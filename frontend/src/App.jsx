// import "./App.less";
import "./main.css";
import './tweet.css';

import Linter from "./linter";
import envoyLogo from "./img/envoy-horizontal-color.svg";

import {React } from "react";
import { Image, Card, Layout, Menu, ConfigProvider, theme } from "antd";
import { Row, Col, Divider } from "antd";

import { HomeOutlined, GithubOutlined } from "@ant-design/icons";

// import { useMatomo } from "@datapunt/matomo-tracker-react";

const { Header, Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

const XPost = () => {
  return (
    <a
      href="https://x.com/kelseyhightower/status/1306060212244111360?s=20"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="tweet">
        <p className="username">@kelseyhightower</p>
        <p className="content">
          The hardest problem in computer science is configuring Envoy using a
          config file.
        </p>
        <p className="time">7:39 PM · Sep 15, 2020</p>
      </div>
    </a>
  );
};

const App = () => {
  // const { trackPageView } = useMatomo();
  // // eslint-disable-next-line
  // React.useEffect(() => {
  //   // eslint-disable-next-line
  //   trackPageView();
  //   // eslint-disable-next-line
  // }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
      <Layout className="layout" style={{ backgroundColor: "#1a1b1e" }}>
        <Header>
          <div className="logo" />
          <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1" icon={<HomeOutlined />}>
              Envoy Config Linter and Validator Online
            </Menu.Item>
            <Menu.Item key="2" icon={<GithubOutlined />}>
              <a href="https://github.com/ysawa0/envoylint">See the Code!</a>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Linter />
          <Divider orientation="left">About</Divider>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="centerh">
            <Col style={{ span: 12 }}>
              <div>
                <Card
                  title="What is this?"
                  className="aboutcards"
                  bordered={true}
                  style={{ marginBottom: 16 }}
                  headStyle={{ fontSize: "20px" }}
                >
                  <p>
                    This site takes a{" "}
                    <a href={"https://www.envoyproxy.io/"}>Envoy</a> config and
                    validates it for you.
                  </p>
                  <XPost />
                </Card>
                <Card
                  title="How does it work?"
                  className="aboutcards"
                  bordered={true}
                  style={{ marginBottom: 16 }}
                  headStyle={{ fontSize: "20px" }}
                >
                  <p>
                    It validates a config via the Envoy{" "}
                    <a
                      href={
                        "https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-mode"
                      }
                    >
                      validate mode
                    </a>{" "}
                    and returns the result.
                    <br />
                  </p>
                </Card>
                <Card
                  title="Do you save any data?"
                  className="aboutcards"
                  bordered={true}
                  style={{ marginBottom: 16 }}
                  headStyle={{ fontSize: "20px" }}
                >
                  <p>
                    No and all sessions are ephemeral. But it's best to never
                    send any sensitive data.
                  </p>
                </Card>
                <Card
                  title="Can I see the code?"
                  className="aboutcards"
                  bordered={true}
                  style={{ marginBottom: 16 }}
                  headStyle={{ fontSize: "20px" }}
                >
                  <p>
                    <a href={"https://github.com/ysawa0/envoylint"}>
                      https://github.com/ysawa0/envoylint
                    </a>
                  </p>
                </Card>
                <Card
                  title="Have any suggestions, questions, see any bugs?"
                  className="aboutcards"
                  bordered={true}
                  style={{ marginBottom: 16 }}
                  headStyle={{ fontSize: "20px" }}
                >
                  <p>
                    Shoot me a message{" "}
                    <a href={"https://twitter.com/yukisww"}>@yukisww</a> or
                    leave a Github issue
                  </p>
                </Card>
              </div>
            </Col>
          </Row>
        </Content>
        <div
          style={{
            textAlign: "center",
            backgroundColor: "#28292a",
            height: "20px",
          }}
        ></div>
        <Footer style={{ textAlign: "center", backgroundColor: "#505050" }}>
          <Image
            width={200}
            src={envoyLogo}
            preview={false}
            style={{ backgroundColor: "white" }}
          />
        </Footer>
        <Footer style={{ textAlign: "center", backgroundColor: "#505050" }}>
          {" "}
          Made for <a href={"https://www.envoyproxy.io/"}>Envoy Proxy</a>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};
export default App;
