import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  deliveryFee: { type: Number, default: 10 }
});

const SettingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);
export default SettingsModel;
