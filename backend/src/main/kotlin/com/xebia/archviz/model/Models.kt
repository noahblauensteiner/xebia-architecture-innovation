package com.xebia.archviz.model

import kotlinx.serialization.Serializable

@Serializable
data class GenerateRequest(
    val projectName: String,
    val packageName: String,
    val nodes: List<ModuleNode>,
    val edges: List<DependencyEdge>,
    val visitorEmail: String? = null,
)

@Serializable
data class ModuleNode(
    val id: String,
    val type: ModuleType,
    val label: String,
)

@Serializable
data class DependencyEdge(
    val source: String,
    val target: String,
)

@Serializable
enum class ModuleType {
    core, database, ui, api, auth, domain, network, test
}

@Serializable
data class GenerateResponse(
    val branchUrl: String?,
    val zipDownloadUrl: String,
    val fileTree: List<String>,
)
