import React, { useState } from "react";
import "./Add.css";
import { assets, url } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = () => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Please upload a product image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);

      if (response.data.success) {
        toast.success("Product added successfully!");

        setData({
          name: "",
          description: "",
          price: "",
          category: data.category,
        });

        setImage(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Error adding product.");
    }
  };

  const onChangeHandler = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  return (
    <div className="add-page">
      <div className="add-card">

        <h2 className="add-title">Add New Product</h2>

        <form className="add-form" onSubmit={onSubmitHandler}>
          {/* IMAGE UPLOAD */}
          <div className="add-image-block">
            <p className="label">Product Image</p>

            <input
              type="file"
              id="image"
              hidden
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                e.target.value = "";
              }}
            />

            <label htmlFor="image" className="upload-box">
              <img
                src={!image ? assets.upload_area : URL.createObjectURL(image)}
                alt="upload"
                className="upload-preview"
              />
            </label>
          </div>

          {/* NAME */}
          <div className="add-field">
            <p className="label">Product Name</p>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={data.name}
              onChange={onChangeHandler}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="add-field">
            <p className="label">Description</p>
            <textarea
              name="description"
              rows={5}
              placeholder="Write a short description..."
              value={data.description}
              onChange={onChangeHandler}
              required
            ></textarea>
          </div>

          {/* CATEGORY + PRICE */}
          <div className="add-row">
            <div className="add-field">
              <p className="label">Category</p>
              <select
                name="category"
                value={data.category}
                onChange={onChangeHandler}
              >
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
            </div>

            <div className="add-field">
              <p className="label">Price</p>
              <input
                type="number"
                name="price"
                placeholder="₹ Price"
                value={data.price}
                onChange={onChangeHandler}
                required
              />
            </div>
          </div>

          <button className="add-btn" type="submit">
            ADD PRODUCT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
