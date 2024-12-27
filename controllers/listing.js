const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id}=req.params;
    const List = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!List){
        req.flash("error","Requested listing does not exists");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{List});
}

module.exports.createListing = async (req,res)=>{

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();            

    let url = req.file.path;
    let filename = req.file.filename;
    const lists = new Listing(req.body.listing);
    lists.owner = req.user._id;
    lists.image = {url,filename};
    lists.geometry = response.body.features[0].geometry; 
    await lists.save();
    req.flash("success","New listing added");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req,res)=>{
    let {id}=req.params;
    const List = await Listing.findById(id);
    if(!List){
        req.flash("error","Requested listing does not exists");
        res.redirect("/listings");
    }
    let imgUrl = List.image.url;
    imgUrl = imgUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{List,imgUrl});
}

module.exports.updateListing = async (req,res)=>{
    let {id}=req.params;
    let lists = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    lists.image = {url,filename};
    await lists.save();
    }
    req.flash("success","List was updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error","Listing was deleted");
    res.redirect("/listings");
}