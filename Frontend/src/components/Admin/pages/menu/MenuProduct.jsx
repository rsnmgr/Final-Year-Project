import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import image from "../.././../../assets/defaultImg.png";
import { LoginContext } from "../../../ContextProvider/Context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConformForm from "./product/DeleteConformForm";
import ProductForm from "./product/ProductForm";
import ProductTable from "./product/ProductTable";

const API_URL = import.meta.env.VITE_API_URL;

export default function Items() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [categoryNames, setCategoryNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    units: [],
    discount: "",
    status: "Active",
  });

  const [details, setDetails] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (AdminId) {
      fetchDetails();
      fetchCategories();
    }
  }, [AdminId]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${AdminId}`);
      setDetails(response.data.products);
      console.log(response.data.products.units);
    } catch (error) {
      toast.error("Error fetching products.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories/${AdminId}`);
      const categoriesData = response.data.categories;

      setCategories(categoriesData);

      // Create a mapping of category ID to name
      const categoryMap = categoriesData.reduce((acc, category) => {
        acc[category._id] = category.name;
        return acc;
      }, {});

      setCategoryNames(categoryMap);
    } catch (error) {
      toast.error("Error fetching categories.");
    }
  };

  const handleToggleModal = (detail = null) => {
    setShowModal(!showModal);

    if (detail) {
      setSelectedDetail(detail);
      setFormData({
        name: detail.name || "",
        category:
          detail.category || (categories.length > 0 ? categories[0]._id : ""),
        units: detail.units ?? [],
        discount: detail.discount || "",
        status: detail.status || "Active",
      });

      // ✅ Fix: Update selected image from backend
      setSelectedImage(detail.image ? `${API_URL}/${detail.image}` : image);
    } else {
      setSelectedDetail(null);
      setFormData({
        name: "",
        category: categories.length > 0 ? categories[0]._id : "",
        units: [],
        discount: "",
        status: "Active",
      });

      setSelectedImage(image); // Reset to default image
    }
  };
  const handleDeleteClick = (detail) => {
    setSelectedDetail(detail);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/products/${AdminId}/${selectedDetail._id}`
      );
      fetchDetails();
      setShowDeleteConfirm(false);
      toast.success("Product deleted successfully.");
    } catch (error) {
      toast.error("Error deleting product.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "units") {
        data.append(key, JSON.stringify(formData[key] || []));
      } else {
        data.append(key, formData[key]);
      }
    });

    if (fileInputRef.current.files[0]) {
      data.append("image", fileInputRef.current.files[0]);
    }

    data.append("AdminId", AdminId);

    try {
      if (selectedDetail) {
        await axios.put(
          `${API_URL}/api/products/${AdminId}/${selectedDetail._id}`,
          data
        );
        toast.success("Product updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/products`, data);
        toast.success("Product added successfully.");
      }
      fetchDetails();
      handleToggleModal();
    } catch (error) {
      toast.error("Error submitting product.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="p-2">
      <ProductTable
        searchTerm={searchTerm}
        details={details}
        handleToggleModal={handleToggleModal}
        handleDeleteClick={handleDeleteClick}
        categoryNames={categoryNames}
      />

      {showModal && (
        <ProductForm
          selectedDetail={selectedDetail}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          handleImageChange={handleImageChange}
          handleChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          categories={categories}
          selectedImage={selectedImage}
          fileInputRef={fileInputRef}
          handleToggleModal={handleToggleModal}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConformForm
          handleDeleteConfirm={handleDeleteConfirm}
          handleDeleteCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
