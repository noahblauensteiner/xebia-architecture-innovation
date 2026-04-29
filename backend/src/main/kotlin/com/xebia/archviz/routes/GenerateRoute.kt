package com.xebia.archviz.routes

import com.xebia.archviz.generator.generateProject
import com.xebia.archviz.model.GenerateRequest
import com.xebia.archviz.model.GenerateResponse
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.generateRoute() {
    post("/generate") {
        val request = call.receive<GenerateRequest>()

        if (request.nodes.isEmpty()) {
            call.respond(HttpStatusCode.BadRequest, "No modules provided")
            return@post
        }

        val result = generateProject(request)

        // Store ZIP in memory and expose as download — in production this would be a blob store
        val zipId = java.util.UUID.randomUUID().toString()
        ZipCache.put(zipId, result.zipBytes)

        val zipDownloadUrl = "/download/$zipId/${request.projectName}.zip"

        // TODO: GitHub branch creation (Phase 3)
        val branchUrl: String? = null

        call.respond(
            GenerateResponse(
                branchUrl = branchUrl,
                zipDownloadUrl = zipDownloadUrl,
                fileTree = result.fileTree,
            )
        )
    }

    get("/download/{id}/{filename}") {
        val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.NotFound)
        val bytes = ZipCache.get(id) ?: return@get call.respond(HttpStatusCode.NotFound, "ZIP expired or not found")
        val filename = call.parameters["filename"] ?: "project.zip"
        call.response.header("Content-Disposition", "attachment; filename=\"$filename\"")
        call.respondBytes(bytes, ContentType("application", "zip"))
    }
}

object ZipCache {
    private val cache = java.util.concurrent.ConcurrentHashMap<String, ByteArray>()

    fun put(id: String, bytes: ByteArray) { cache[id] = bytes }
    fun get(id: String): ByteArray? = cache[id]
}
