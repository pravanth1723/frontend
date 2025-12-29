import React from "react";
import PaymentMethods from "../components/PaymentMethods";
import Income from "../components/Income";

import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="room-container">
      {/* Payment Methods Section */}
      <PaymentMethods />

      {/* Income Section */}
      <Income />
    </div>
  );
};

export default Dashboard;
