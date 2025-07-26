import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactCheckout from './ReactCheckout';
import './Payout.css'; // Import CSS

export default function ReactPayPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="pay-page-wrapper">
      <ReactCheckout productId={productId} />
    </div>
  );
}
