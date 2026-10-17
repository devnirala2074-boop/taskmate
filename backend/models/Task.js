const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        assignedTo: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ],
            required: true,
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0;
                },
                message: "At least one assigned user is required"
            }
        },

        memberProgress: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                status: {
                    type: String,
                    enum: ["Pending", "In Progress", "Completed"],
                    default: "Pending"
                },
                progress: {
                    type: Number,
                    min: 0,
                    max: 100,
                    default: 0
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium"
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending"
        },

        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        dueDate: {
            type: Date,
            required: true
        },

        comments: [
            {
                text: {
                    type: String,
                    trim: true
                },

                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);