// ------ delete modal ------
document.querySelectorAll(".delete-button").forEach((deleteButton) => {
	deleteButton.addEventListener("click", () => {
		console.log("delete clicked");
		document.querySelector("#delete-container").classList.remove("hidden");
	});
});

document.querySelector(".secondary-button").addEventListener("click", () => {
	document.querySelector("#delete-container").classList.add("hidden");
});

// ------ extension - redirect view ------

document.querySelectorAll(".left").forEach((folder) => {
	folder.addEventListener("click", (e) => {
		vscode.postMessage({
			page: "note",
		});
	});
});

// ------ dropdown ------
function list(data = [], sourcePath, sourceFoldername) {
	if (data.length > 0) {
		const ul = document.createElement("ul");
		data.forEach((folder) => {
			const li = document.createElement("li");
			li.id = folder.folderName;
			const a = document.createElement("a");
			const p = document.createElement("p");
			p.textContent = folder.folderName;
			if (folder.uriPath === sourcePath) {
				p.style.color = "#747474";
				li.style.cursor = "not-allowed";
			}
			a.appendChild(p);
			if (folder.subfolders && folder.subfolders.length > 0) {
				const icon = document.createElement("span");
				icon.classList.add("codicon");
				icon.classList.add("codicon-chevron-right");
				a.appendChild(icon);
			}
			li.appendChild(a);
			listenForMouseOver(li, folder.subfolders, sourcePath);
			if (folder.uriPath !== sourcePath) {
				clickOnFolder(li, folder, sourcePath, sourceFoldername);
			}
			ul.appendChild(li);
		});
		return ul;
	}
}

function clickOnFolder(option, folder, sourcePath, sourceFoldername) {
	option.addEventListener("click", () => {
		document.querySelector(`[data-folder-name="${sourceFoldername}"]`).classList.add("hidden");
		vscode.postMessage({
			command: "move",
			pathTo: folder.uriPath,
			pathFrom: sourcePath,
		});
	});
}

function listenForMouseOver(option, subfolders, sourcePath) {
	option.addEventListener(
		"mouseover",
		() => {
			if (subfolders !== undefined) {
				option.appendChild(list(subfolders, sourcePath));
			}
		},
		{ once: true }
	);
}

document.querySelectorAll(".settings-container").forEach((button) => {
	button.addEventListener("click", () => {
		button.querySelector(".dropdown").classList.toggle("hidden");
	});
});

document.addEventListener("click", (e) => {
	let isClickInside = false;
	document.querySelectorAll(".settings-container").forEach((container) => {
		if (container.contains(event.target)) {
			isClickInside = true;
		}
	});
	if (!isClickInside) {
		document.querySelectorAll(".dropdown").forEach((dropdown) => dropdown.classList.add("hidden"));
	}
});
