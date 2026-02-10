import React, { useEffect, useState } from 'react';
import './List.css';
import { url, currency } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to load items");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list-page">
      <div className="list-container">
        <h2 className="list-title">All Foods List</h2>

        <div className="list-card">
          <div className="list-header">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Action</span>
          </div>

          <div className="list-body">
            {list.map((item, index) => (
              <div key={index} className="list-row">
                <img src={`${url}/images/${item.image}`} alt={item.name} />

                <span className="food-name">{item.name}</span>
                <span>{item.category}</span>
                <span>{currency}{item.price}</span>

                <button
                  className="delete-btn"
                  onClick={() => removeFood(item._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default List;
