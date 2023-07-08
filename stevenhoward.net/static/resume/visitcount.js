api_url = "https://32q5jrub61.execute-api.us-west-2.amazonaws.com/prod/viewcount";

fetch(api_url, { method: "GET" })
  .then((res) => res.json())
  .then((data) => {
    viewcount_element = document.getElementById("view_count");
    viewcount_element.innerHTML = `${data}`;
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
