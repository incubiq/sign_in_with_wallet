
const getTheme = () => {
  return {
      name: "Cardano",
      symbol: "SIWC",
      logo: "/assets/images/siwc_logo.png",
      webapp: {
        dark_mode: false,
        background:  "/assets/images/siwc_background.jpg",
        logo: "/assets/images/www_logo.png",
        color: {
            text: "#333",
            button: "#003366",
            button_text: "#f0f0f0"
        }
      }
  }
}

const getStyles = () => {
  const styleContainer = {}
  const styleColor = {}

  let theme=getTheme()
  if (theme && theme.webapp && theme.webapp.background) {
      styleContainer.backgroundImage="url("+theme.webapp.background+")";
  }
  if (theme && theme.webapp && theme.webapp.color.text) {
      styleColor.color=theme.webapp.color.text;
  }
  return {
      container: styleContainer,
      color: styleColor
  }
}

export {
  getTheme,
  getStyles
};
