import React, { Component } from "react";
import { Button, Divider } from "antd";
import axios from "axios";
import { Form, Input, Row, Col, Radio } from "antd";

import {
  FireTwoTone,
  LoadingOutlined,
  CloseCircleTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { mockConf, linterBaseUrl } from "./util";

import { useMatomo } from "@datapunt/matomo-tracker-react";

const { TextArea } = Input;
const layout = {
  labelCol: {
    span: 0,
  },
  wrapperCol: {
    span: 24,
  },
};

export default class Linter extends Component {
  state = {
    conf: mockConf,
    out: "",
    pass: false,
    fail: false,
    load: false,
    error: false,
    apiVer: "v1160",
  };

  formRef = React.createRef();
  radioRef = React.createRef();

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ load: true });
    this.setState({ pass: false, fail: false, error: false });
    const conf = this.state.conf;
    const data = { conf: conf };
    let url = "";
    if (this.state.apiVer === "clct") {
      url = `${linterBaseUrl}/clct`;
    } else {
      url = `${linterBaseUrl}/envoy${this.state.apiVer}`;
    }

    const { trackEvent } = useMatomo();
    trackEvent({ category: "lint", action: this.state.apiVer });

    axios
      .post(url, data, { timeout: 40000 })
      .then((res) => {
        let out = res.data.out.split("\n");
        let err = res.data.err.split("\n");
        let txt = [];
        let badConf = false;
        for (let i = 0; i < err.length; i++) {
          const c = err[i];
          if (c.startsWith("TestRandomGenerator")) {
            continue;
          } else if (c.includes("testing /tmp/")) {
            continue;
          }
          if (c.includes("INVALID_ARGUMENT")) {
            badConf = true;
          }
          txt.push(c);
        }
        txt.push("------------");
        for (let i = 0; i < out.length; i++) {
          const c = out[i];
          if (c.startsWith("TestRandomGenerator")) {
            continue;
          }
          if (c.includes("INVALID_ARGUMENT")) {
            badConf = true;
          }
          txt.push(c);
        }
        this.setState({ load: false });
        if (badConf) {
          this.setState({ fail: true });
          for (let i = 0; i < txt.length; i++) {
            if (txt[i].includes("No failures.")) {
              txt[i] = txt[i].replace("No failures.", "");
            }
          }
        } else if (res.data.code === 0) {
          this.setState({ pass: true });
        } else {
          this.setState({ fail: true });
        }

        this.setState({ out: txt.join("\n") });
      })
      .catch((res) => {
        this.setState({ out: res.code + "\n" + res.message });
        this.setState({ error: true, load: false });
      });
  };

  handleChange = (e) => {
    this.setState({ conf: this.formRef.current.getFieldValue("envoy-conf") });
  };

  changeAPI = (e) => {
    this.setState({ apiVer: this.formRef.current.getFieldValue("api-ver") });
  };

  render() {
    return (
      <>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className="gutter-row" span={12}>
            <Divider orientation="left">envoy conf</Divider>
            <Form {...layout} name="nest-messages" ref={this.formRef}>
              <Form.Item name="envoy-conf">
                <Input.TextArea
                  rows={30}
                  value={this.state.conf}
                  onChange={this.handleChange}
                  defaultValue={mockConf}
                />
              </Form.Item>
              <Form.Item name="api-ver" label="Validate with">
                <Radio.Group
                  name="api-ver"
                  defaultValue="v1162"
                  buttonStyle="solid"
                  onChange={this.changeAPI}
                  value={this.state.apiVer}
                >
                  <Radio.Button value="v1162">v1.16.2</Radio.Button>
                  <Radio.Button value="v1160">v1.16.0</Radio.Button>
                  {/* <Radio.Button value="v1152">v1.15.2</Radio.Button> */}
                  <Radio.Button value="v1145">v1.14.5</Radio.Button>
                  <Radio.Button value="v1134">v1.13.4</Radio.Button>
                  <Radio.Button value="v1127">v1.12.7</Radio.Button>
                  <Radio.Button value="clct">
                    config_load_check_tool
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSubmit}
                >
                  Validate
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col className="gutter-row" span={12}>
            <Divider orientation="left">results</Divider>
            <TextArea rows={30} value={this.state.out} />
          </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="centerh">
          <Col>
            <div
              style={{
                fontSize: "120px",
              }}
            >
              <LoadingOutlined
                style={!this.state.load ? { display: "none" } : {}}
              />
              <div style={!this.state.pass ? { display: "none" } : {}}>
                <CheckCircleTwoTone twoToneColor="#52c41a" /> config passed!
              </div>
              <div style={!this.state.fail ? { display: "none" } : {}}>
                <CloseCircleTwoTone twoToneColor="#eb2f96" /> config failed
                validation
              </div>
              <div style={!this.state.error ? { display: "none" } : {}}>
                <FireTwoTone twoToneColor="#eb2f96" />
                api error
              </div>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}
