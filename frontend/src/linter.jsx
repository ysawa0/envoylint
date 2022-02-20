import React, { useState } from "react";
import { Button, Divider } from "antd";
import axios from "axios";
import { Form, Input, Row, Col, Radio } from "antd";

import {
  FireTwoTone,
  LoadingOutlined,
  CloseCircleTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { useMatomo } from "@datapunt/matomo-tracker-react";

import { mockConf, linterBaseUrl, SUPPORTED_VERS } from "./util";

const { TextArea } = Input;
const layout = {
  labelCol: {
    span: 0,
  },
  wrapperCol: {
    span: 24,
  },
};

const DEFAULT_ENVOY_VER = SUPPORTED_VERS[0].replaceAll(".", "");

const Linter = () => {
  const formRef = React.createRef();
  const [conf, setConf] = useState(mockConf);
  const [output, setOutput] = useState("");
  const [pass, setPass] = useState(false);
  const [fail, setFail] = useState(false);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const [apiVer, setApiVer] = useState(DEFAULT_ENVOY_VER);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoad(true);
    setPass(false);
    setFail(false);
    setError(false);
    const data = { conf: conf };
    let url = `${linterBaseUrl}/envoy${apiVer}`;

    trackEvent({ category: "lint", action: apiVer });

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
        setLoad(false);
        if (badConf) {
          setFail(true);
          for (let i = 0; i < txt.length; i++) {
            if (txt[i].includes("No failures.")) {
              txt[i] = txt[i].replace("No failures.", "");
            }
          }
        } else if (res.data.code === 0) {
          setPass(true);
        } else {
          setFail(true);
        }

        setOutput(txt.join("\n"));
      })
      .catch((res) => {
        setOutput(res.code + "\n" + res.message);
        setError(true);
        setLoad(false);
      });
  };

  const handleChange = (e) => {
    setConf(formRef.current.getFieldValue("envoy-conf"));
  };

  const changeAPI = (e) => {
    setApiVer(formRef.current.getFieldValue("api-ver"));
  };

  const { trackEvent } = useMatomo();
  const verButtons = [];
  for (let v of SUPPORTED_VERS) {
    let vv = v.replaceAll(".", "");
    verButtons.push(
      <Radio.Button value={vv} key={vv}>
        {v}
      </Radio.Button>
    );
  }

  return (
    <>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col className="gutter-row" span={12}>
          <Divider orientation="left">envoy conf</Divider>
          <Form {...layout} name="nest-messages" ref={formRef}>
            <Form.Item name="envoy-conf">
              <Input.TextArea
                rows={30}
                value={conf}
                onChange={handleChange}
                defaultValue={mockConf}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item name="api-ver" label="Validate with">
              <Radio.Group
                name="api-ver"
                defaultValue={DEFAULT_ENVOY_VER}
                buttonStyle="solid"
                onChange={changeAPI}
                value={apiVer}
              >
                {verButtons}
              </Radio.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 0 }}>
              <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                Validate
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col className="gutter-row" span={12}>
          <Divider orientation="left">results</Divider>
          <TextArea rows={30} value={output} />
        </Col>
      </Row>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="centerh">
        <Col>
          <div
            style={{
              fontSize: "120px",
            }}
          >
            <LoadingOutlined style={!load ? { display: "none" } : {}} />
            <div style={!pass ? { display: "none" } : {}}>
              <CheckCircleTwoTone twoToneColor="#52c41a" /> config passed!
            </div>
            <div style={!fail ? { display: "none" } : {}}>
              <CloseCircleTwoTone twoToneColor="#eb2f96" /> config failed
              validation
            </div>
            <div style={!error ? { display: "none" } : {}}>
              <FireTwoTone twoToneColor="#eb2f96" />
              api error
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Linter;
