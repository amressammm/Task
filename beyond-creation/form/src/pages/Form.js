import { async } from "q";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Select from "react-select";
import "../styles/Form.css";
const axios = require("axios");

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const Form = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setproducts] = useState([]);
  const [selectedProduct, setSelectedproduct] = useState();

  useEffect(() => {
    handleCategories();
  }, []);

  const handleCategories = async () => {
    let res = await axios.get(
      `https://obscure-woodland-00834.herokuapp.com/api/Categories`
    );

    let result = res.data.data.map((a) => {
      return { value: a.id, label: a.attributes.Name };
    });

    setCategories(result);
  };

  const handleProducts = async (e) => {
    if (e) {
      let res = await axios.get(
        `https://obscure-woodland-00834.herokuapp.com/api/Categories/${e.value}?fields=name&populate=products`
      );

      let result = res.data.data.attributes.products.data.map((a) => {
        return { value: a.id, label: a.attributes.Name };
      });
      setproducts(result);
    }
  };

  const handleProductID = (e) => {
    if (e) {
      setSelectedproduct(e.value);
    }
  };

  const handleClick = async () => {
    if (selectedProduct) {
      navigate("/showPage", { state: { selectedProduct } });
    }
  };

  return (
    <div className="backGround">
      <div className="container">
        <h1>Please select the categorie and the product !!</h1>
        <Select
          className="firstOption"
          options={categories}
          onChange={handleProducts}
        />
        <Select options={products} onChange={handleProductID} />
        <div className="buttonDiv">
          <button className="button" onClick={handleClick}>
            Show price
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
