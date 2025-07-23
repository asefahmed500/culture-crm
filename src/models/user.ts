
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false },
});

UserSchema.pre('save', async function (next) {
    // Only select password if it's a new document or if the password has been modified.
    // This is to avoid exposing the password hash in regular queries.
    if (this.isNew || this.isModified('password')) {
        // Ensure we don't interfere with password-less (OAuth) users
        if (this.password) {
            this.password = this.get('password', null, { getters: false });
        }
    }
    next();
});

const User = (models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export default User;
