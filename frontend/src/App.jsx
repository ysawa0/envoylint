import React from "react";
import { Row, Col, Divider } from "antd";
import "./App.less";
import "./main.css";
import Linter from "./linter";

import { Image, Card, Layout, Menu } from "antd";
import { HomeOutlined, GithubOutlined } from "@ant-design/icons";
import { Tweet } from "react-twitter-widgets";

import { useMatomo } from "@datapunt/matomo-tracker-react";

const { Header, Content, Footer } = Layout;

const logo = require("./img/envoy-horizontal-color.svg");

const App = () => {
  const { trackPageView } = useMatomo();

  // eslint-disable-next-line
  React.useEffect(() => {
    // eslint-disable-next-line
    trackPageView();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout className="layout" style={{ backgroundColor: "#1a1b1e" }}>
      <Header>
        <div className="logo" />
        <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Envoy Config Linter and Validator Online
          </Menu.Item>
          {/* <Menu.Item key="2" icon={<GithubOutlined />}>
            See the Code!
          </Menu.Item> */}
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
                <Tweet tweetId="1306060212244111360" />
              </Card>
              <Card
                title="How does it work?"
                className="aboutcards"
                bordered={true}
                style={{ marginBottom: 16 }}
                headStyle={{ fontSize: "20px" }}
              >
                <p>
                  It sends the config to a Lambda running Envoy in{" "}
                  <a
                    href={
                      "https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-mode"
                    }
                  >
                    validate mode
                  </a>{" "}
                  or against the{" "}
                  <a
                    href={
                      "https://www.envoyproxy.io/docs/envoy/latest/install/tools/config_load_check_tool"
                    }
                  >
                    config_load_check_tool
                  </a>{" "}
                  and prints the result.
                  <br />
                  There is a 30 second timeout on the linter due to API Gateway
                  limitations. Extremely large configs may reach that.
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
                  No and all sessions run on ephemeral Lambda containers. But
                  it's best to never send any sensitive data.
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
                  <a href={"https://twitter.com/yukisww"}>@yukisww</a> or yuki
                  [at] yukisawa . com
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
          src={logo}
          preview={false}
          style={{ backgroundColor: "white" }}
        />
      </Footer>
      <Footer style={{ textAlign: "center", backgroundColor: "#505050" }}>
        {" "}
        Made for <a href={"https://www.envoyproxy.io/"}>Envoy Proxy</a>
      </Footer>
    </Layout>
  );
};
export default App;
