require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// تأكد أن MONGO_URI يتم قراءته بشكل صحيح
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("❌ خطأ: MONGO_URI غير موجود في ملف .env");
    process.exit(1);
}

// الاتصال بقاعدة البيانات
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ تم الاتصال بقاعدة البيانات MongoDB");
}).catch((err) => {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err);
});

// تعريف نموذج المحطة
const Station = mongoose.model("Station", new mongoose.Schema({
    name: String,
    line: String,
    connections: [{ stationId: String, distance: Number }]
}));

// تعريف نموذج المسار
const Route = mongoose.model("Route", new mongoose.Schema({
    line: String,
    stations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Station" }]
}));

// خوارزمية Dijkstra لحساب أقصر مسار
function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const queue = new Set();

    for (const vertex in graph) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
        queue.add(vertex);
    }

    distances[start] = 0;

    while (queue.size) {
        let smallest = null;
        for (const vertex of queue) {
            if (smallest === null || distances[vertex] < distances[smallest]) {
                smallest = vertex;
            }
        }

        if (smallest === end) {
            const path = [];
            while (previous[smallest]) {
                path.push(smallest);
                smallest = previous[smallest];
            }
            return path.concat(smallest).reverse();
        }

        queue.delete(smallest);

        for (const neighbor in graph[smallest]) {
            const alt = distances[smallest] + graph[smallest][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = smallest;
            }
        }
    }

    return null;
}

// API لحساب أقصر مسار
app.post("/shortest-path", async (req, res) => {
    const { startStationId, endStationId } = req.body;

    const stations = await Station.find();
    const graph = {};

    stations.forEach(station => {
        graph[station._id] = {};
        station.connections.forEach(connection => {
            graph[station._id][connection.stationId] = connection.distance;
        });
    });

    const shortestPath = dijkstra(graph, startStationId, endStationId);

    if (shortestPath) {
        const pathStations = await Station.find({ _id: { $in: shortestPath } });
        res.json({ path: pathStations });
    } else {
        res.status(404).json({ message: "No path found" });
    }
});

const PORT = process.env.PORT || 5000;
console.log(`🚀 Server running at: http://localhost:${PORT}`);