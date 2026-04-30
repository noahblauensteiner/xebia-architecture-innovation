package com.xebia.archviz.generator

import com.xebia.archviz.model.GenerateRequest
import java.nio.file.Path
import kotlin.io.path.*

data class GeneratedProject(
    val outputPath: Path,
    val fileTree: List<String>,
)

fun generateProject(request: GenerateRequest): GeneratedProject {
    val root = request.projectName.sanitize()
    val packagePath = request.packageName.replace('.', '/')
    val files = mutableMapOf<String, String>()
    val treeLines = mutableListOf<String>()

    // Root settings
    val moduleIncludes = request.nodes.joinToString(", ") { "\":${it.label.sanitize()}\"" }
    files["settings.gradle.kts"] = settingsGradle(root, moduleIncludes)
    files["build.gradle.kts"] = rootBuildGradle()
    files["gradle/libs.versions.toml"] = versionCatalog()

    treeLines += "📁 $root/"
    treeLines += "├── settings.gradle.kts"
    treeLines += "├── build.gradle.kts"

    // Build dependency map: nodeId -> label
    val nodeLabels = request.nodes.associate { it.id to it.label.sanitize() }

    // Per-module deps from edges
    val moduleDepsFromEdges: Map<String, List<String>> = request.edges
        .groupBy { it.source }
        .mapValues { (_, edges) ->
            edges.mapNotNull { nodeLabels[it.target] }
                .map { """implementation(project(":$it"))""" }
        }

    request.nodes.forEachIndexed { index, node ->
        val moduleName = node.label.sanitize()
        val isLast = index == request.nodes.size - 1
        val prefix = if (isLast) "└──" else "├──"
        val childPrefix = if (isLast) "    " else "│   "

        val typeDeps = depsFor(node.type)
        val projectDeps = moduleDepsFromEdges[node.id] ?: emptyList()
        val allDeps = typeDeps.dependencies + projectDeps

        val buildGradle = moduleBuildGradle(typeDeps.plugins, allDeps)
        val stubClass = stubKotlinClass(request.packageName, moduleName)

        val moduleBase = "$moduleName/"
        val srcPath = "$moduleBase/src/main/kotlin/$packagePath/$moduleName"

        files["$moduleBase/build.gradle.kts"] = buildGradle
        files["$srcPath/${moduleName.capitalize()}.kt"] = stubClass

        treeLines += "$prefix 📁 $moduleName/"
        treeLines += "${childPrefix}├── build.gradle.kts"
        treeLines += "${childPrefix}└── 📁 src/main/kotlin/$packagePath/$moduleName/"
        treeLines += "${childPrefix}    └── ${moduleName.capitalize()}.kt"
    }

    // ArchUnit stub module
    files["archunit-rules/build.gradle.kts"] = archunitBuildGradle()
    files["archunit-rules/src/test/kotlin/$packagePath/arch/ArchitectureTest.kt"] = archunitStub(request.packageName)
    treeLines += "└── 📁 archunit-rules/  🛡️"

    val outputPath = writeToDirectory(root, files)
    return GeneratedProject(outputPath = outputPath, fileTree = treeLines)
}

private fun String.sanitize() = lowercase().replace(Regex("[^a-z0-9-]"), "-").trim('-')
private fun String.capitalize() = replaceFirstChar { it.uppercase() }

private fun writeToDirectory(root: String, files: Map<String, String>): Path {
    val outputDir = Path(System.getProperty("user.dir")).parent.resolve("output").resolve(root)
    if (outputDir.exists()) outputDir.toFile().deleteRecursively()
    outputDir.createDirectories()

    files.forEach { (relativePath, content) ->
        val file = outputDir.resolve(relativePath)
        file.parent.createDirectories()
        file.writeText(content, Charsets.UTF_8)
    }
    return outputDir
}

private fun settingsGradle(rootName: String, includes: String) = """
rootProject.name = "$rootName"
${ if (includes.isNotEmpty()) """include($includes, ":archunit-rules")""" else """include(":archunit-rules")""" }
""".trimIndent()

private fun rootBuildGradle() = """
plugins {
    kotlin("jvm") version "2.1.0" apply false
}

allprojects {
    group = "com.xebia"
    version = "0.1.0"

    repositories {
        mavenCentral()
    }
}
""".trimIndent()

private fun versionCatalog() = """
[versions]
kotlin = "2.1.0"
ktor = "3.1.2"
exposed = "0.57.0"
kotest = "5.9.1"
mockk = "1.13.13"

[libraries]
ktor-server-core = { module = "io.ktor:ktor-server-core", version.ref = "ktor" }
ktor-server-netty = { module = "io.ktor:ktor-server-netty", version.ref = "ktor" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
""".trimIndent()

private fun moduleBuildGradle(plugins: List<String>, deps: List<String>): String {
    val pluginBlock = plugins.joinToString("\n    ") { it }
    val depsBlock = if (deps.isEmpty()) "" else """
dependencies {
    ${deps.joinToString("\n    ")}
}
""".trimIndent()
    return """
plugins {
    $pluginBlock
}

$depsBlock
""".trimIndent()
}

private fun stubKotlinClass(packageName: String, moduleName: String) = """
package $packageName.$moduleName

object ${moduleName.replaceFirstChar { it.uppercase() }} {
    // TODO: implement ${moduleName} module
}
""".trimIndent()

private fun archunitBuildGradle() = """
plugins {
    kotlin("jvm")
}

dependencies {
    testImplementation("com.tngtech.archunit:archunit-junit5:1.3.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
}

tasks.test {
    useJUnitPlatform()
}
""".trimIndent()

private fun archunitStub(packageName: String) = """
package $packageName.arch

import com.tngtech.archunit.junit.AnalyzeClasses
import com.tngtech.archunit.junit.ArchTest
import com.tngtech.archunit.lang.ArchRule
import com.tngtech.archunit.library.Architectures.layeredArchitecture

// Xebia opinionated architecture rules — add your rules here
@AnalyzeClasses(packages = ["$packageName"])
class ArchitectureTest {

    @ArchTest
    val `ui must not depend on database directly`: ArchRule =
        layeredArchitecture()
            .consideringAllDependencies()
            .layer("UI").definedBy("$packageName.ui..")
            .layer("Database").definedBy("$packageName.database..")
            .whereLayer("UI").mayNotAccessLayersIgnoringDependency("Database")
}
""".trimIndent()
