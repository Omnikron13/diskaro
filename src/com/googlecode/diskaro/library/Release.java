/**
 * 
 */
package com.googlecode.diskaro.library;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author S4T4N
 *
 */
public class Release {
	protected int id;
	protected String name;
	protected Integer year = null;
	protected Label label = null;
	
	public Label getLabel() {
		return label;
	}
	
	public Release(String name) throws SQLException {
		PreparedStatement ps = Library.getDB().prepareStatement("SELECT * FROM releases WHERE name = ?;");
		ps.setString(1, name);
		ResultSet rs = ps.executeQuery();
		this.id = rs.getInt("id");
		this.name = rs.getString("name");
		this.year = rs.getInt("year");
		this.label = new Label(rs.getInt("labelID"));
	}
	
	public static Release add(String name, Integer year, Label label) throws SQLException {
		PreparedStatement ps = Library.getDB().prepareStatement("INSERT INTO releases (name, year, labelID) VALUES (?, ?, ?);");
		ps.setString(1, name);
		if(year != null) {
			ps.setInt(2, year);
		}
		if(label != null) {
			ps.setInt(3, label.getID());
		}
		ps.executeUpdate();
		return new Release(name);
	}
}
