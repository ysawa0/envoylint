import React from "react";
import "./Tweet.css"; // Make sure to create this CSS file

const Tweet = () => {
  return (
    <div className="tweet">
      <h3>Kelsey Hightower</h3>
      <p className="username">@kelseyhightower</p>
      <p className="content">
        The hardest problem in computer science is configuring Envoy using a
        config file.
      </p>
      <p className="time">7:39 PM · Sep 15, 2020</p>
    </div>
  );
};

export default Tweet;
