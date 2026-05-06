package com.xebia.archviz.generator

import com.xebia.archviz.model.ModuleType

data class ModuleDeps(
    val dependencies: List<String> = emptyList(),
    val plugins: List<String> = emptyList(),
)

fun depsFor(type: ModuleType): ModuleDeps = when (type) {
    ModuleType.core -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
    )
    ModuleType.database -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
        dependencies = listOf(
            """implementation("org.jetbrains.exposed:exposed-core:0.57.0")""",
            """implementation("org.jetbrains.exposed:exposed-dao:0.57.0")""",
            """implementation("org.jetbrains.exposed:exposed-jdbc:0.57.0")""",
            """implementation("com.zaxxer:HikariCP:6.2.1")""",
        ),
    )
    ModuleType.ui -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
        dependencies = listOf(
            """implementation("io.ktor:ktor-server-html-builder:3.1.2")""",
        ),
    )
    ModuleType.api -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
        dependencies = listOf(
            """implementation("io.ktor:ktor-server-core:3.1.2")""",
            """implementation("io.ktor:ktor-server-netty:3.1.2")""",
            """implementation("io.ktor:ktor-server-content-negotiation:3.1.2")""",
            """implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.2")""",
        ),
    )
    ModuleType.domain -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
    )
    ModuleType.incomingPort -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
    )
    ModuleType.incomingAdapter -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
        dependencies = listOf(
            """implementation("io.ktor:ktor-server-core:3.1.2")""",
            """implementation("io.ktor:ktor-server-netty:3.1.2")""",
            """implementation("io.ktor:ktor-server-content-negotiation:3.1.2")""",
            """implementation("io.ktor:ktor-serialization-kotlinx-json:3.1.2")""",
        ),
    )
    ModuleType.outgoingPort -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
    )
    ModuleType.outgoingAdapter -> ModuleDeps(
        plugins = listOf("""kotlin("jvm")"""),
        dependencies = listOf(
            """implementation("org.jetbrains.exposed:exposed-core:0.57.0")""",
            """implementation("org.jetbrains.exposed:exposed-dao:0.57.0")""",
            """implementation("org.jetbrains.exposed:exposed-jdbc:0.57.0")""",
            """implementation("com.zaxxer:HikariCP:6.2.1")""",
        ),
    )
}
