package com.xebia.archviz.routes

import com.xebia.archviz.generator.generateProject
import com.xebia.archviz.model.GenerateRequest
import com.xebia.archviz.model.GenerateResponse
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.slf4j.LoggerFactory

private val log = LoggerFactory.getLogger("GenerateRoute")

fun Route.generateRoute() {
    post("/generate") {
        val request = call.receive<GenerateRequest>()

        if (request.nodes.isEmpty()) {
            call.respond(HttpStatusCode.BadRequest, "No modules provided")
            return@post
        }

        log.info("Generating '${request.projectName}' — ${request.nodes.size} modules: ${request.nodes.map { it.label }}")

        val result = generateProject(request)

        log.info("Written to: ${result.outputPath}")

        call.respond(
            GenerateResponse(
                branchUrl = null,
                zipDownloadUrl = "",
                fileTree = result.fileTree,
            )
        )
    }
}
