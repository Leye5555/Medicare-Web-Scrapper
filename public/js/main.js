const container = document.querySelector(".container");
        const appealNumber = document.getElementById("edit-appeal-number");
        const contractNumber = document.getElementById("edit-contract-number");
        const dateType = document.querySelector("#edit-date-type");
        const startDate = document.getElementById("edit-start-date");
        const endDate = document.getElementById("edit-end-date");
        const dtIndex = document.getElementById("data-set");
        const dtSingle = document.getElementById("data-page");
        const form = document.querySelector("form");
    
      // create dialog
      const dialog = document.createElement("div");

      const scraperFunction = async () => {
        try {
          if ( document.querySelector("#dialog") !== null) return;
          const search = {
                      'appeal-number': appealNumber.value,
                      'contract-number': contractNumber.value,
                      'date-type': dateType.options[dateType.selectedIndex].value,
                      'start-date': startDate.value,
                      'end-date': endDate.value,
                      dtIndex : dtIndex.value,
                      dtSingle : dtSingle.value,
                      op: 'Search'
                   }
        if ( (search["appeal-number"] === "" && search["contract-number"] === "")) {
            appealNumber.style.border = "2px solid red";
            contractNumber.style.border = "2px solid red";
            window.scrollTo(0,150);
            form.scrollTop = 0;
        }
        if (search["start-date"] === ""){
            startDate.style.border = "2px solid red";
        } 
        if (search["end-date"] === ""){
            endDate.style.border = "2px solid red";
        }
        if ( (search["appeal-number"] == "" && search["contract-number"] === "") || search["start-date"] === "" || search["end-date"] === "") return;
        dialog.setAttribute("id", "dialog");
        dialog.style.backgroundColor = "rgba(0,0,0, 0.5)";
        dialog.style.position = "fixed";
        dialog.style.top = "0";
        dialog.style.bottom = "0";
        dialog.style.left = "0";
        dialog.style.right = "0";
        dialog.style.width = "100vw";
        dialog.style.height = "100vh";
        dialog.style.zIndex = "10";
        const dialogContent = document.createElement("div");
        dialogContent.style.borderRadius = "10px";
        dialogContent.style.maxWidth = "max-content";
        dialogContent.style.padding = "2rem"
        dialogContent.style.height = "max-content";
        dialogContent.style.position = "absolute";
        dialogContent.style.top = "0";
        dialogContent.style.bottom = "0";
        dialogContent.style.left = "0";
        dialogContent.style.right = "0";
        dialogContent.style.background = "white";
        dialogContent.style.textAlign = "center";
        dialogContent.style.margin = "auto";
        const download = document.createElement("h1");
        download.style.color = "blue";
        download.style.fontSize = "3rem";
        download.textContent = "Scraping...";
        dialogContent.appendChild(download);
        dialog.appendChild(dialogContent)
        container.appendChild(dialog); 
        const { data } = await axios.post("/scraper", search);
        if (data.message === "ok"){
            window.open("/scraper/download", "_self");
            container.removeChild(document.querySelector("#dialog"));  
        }
        
          
        } catch (err) {
          console.log(err);
        }
      };
    